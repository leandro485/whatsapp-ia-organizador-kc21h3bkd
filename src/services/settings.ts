import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'

export const getUserSettings = async (userId: string) => {
  try {
    return await pb.collection('user_settings').getFirstListItem(`user="${userId}"`)
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return null
    }
    console.error('Error fetching user settings:', error)
    throw error // Throw to prevent accidental creation when fetch fails
  }
}

export const updateUserSettings = async (id: string, data: any) => {
  return pb.collection('user_settings').update(id, data)
}

export const createUserSettings = async (data: any) => {
  return pb.collection('user_settings').create(data)
}

// Dictionary lock to prevent concurrent initialization requests per user
const ensurePromises: Record<string, Promise<any>> = {}

export const ensureUserSettings = async (userId: string) => {
  // If a request is already in flight for this user, return the same promise to ensure idempotency
  if (ensurePromises[userId]) {
    return ensurePromises[userId]
  }

  ensurePromises[userId] = (async () => {
    // Exact schema alignment for full payload consistency
    const defaultSettings = {
      user: userId,
      whatsapp_connected: false,
      ai_aggressiveness: 50,
      categories: ['Trabalho', 'Família', 'Financeiro', 'Vendas'],
      reminders_enabled: true,
      reminder_lead_time: 15,
    }

    try {
      // 1. Pre-creation Check: verify if a record already exists
      const existing = await getUserSettings(userId)

      if (existing) {
        // 2. Conditional Logic: Skip create, perform an update (PATCH) if necessary
        let needsUpdate = false
        const updateData: Record<string, any> = {}

        if (existing.reminders_enabled === undefined) {
          updateData.reminders_enabled = defaultSettings.reminders_enabled
          needsUpdate = true
        }
        if (existing.reminder_lead_time === undefined) {
          updateData.reminder_lead_time = defaultSettings.reminder_lead_time
          needsUpdate = true
        }
        if (!existing.categories || !Array.isArray(existing.categories)) {
          updateData.categories = defaultSettings.categories
          needsUpdate = true
        }

        if (needsUpdate) {
          try {
            return await updateUserSettings(existing.id, updateData)
          } catch (updateError) {
            console.error('Failed to update existing settings:', updateError)
            return existing
          }
        }

        return existing
      }

      // 3. Conditional creation with validated payload to avoid HTTP 400
      try {
        return await createUserSettings(defaultSettings)
      } catch (createError) {
        if (createError instanceof ClientResponseError && createError.status === 400) {
          console.warn(
            'Failed to create settings (400), checking for concurrent creation...',
            createError?.response,
          )
          const concurrentExisting = await getUserSettings(userId)
          if (concurrentExisting) return concurrentExisting
        }
        throw createError
      }
    } catch (error) {
      // Graceful error handling: return defaults so the app doesn't crash or show white screen
      console.error('Failed to ensure user settings. Using local defaults.', error)
      return {
        id: 'local-default',
        ...defaultSettings,
      }
    }
  })()

  try {
    return await ensurePromises[userId]
  } finally {
    // Clear lock after resolution
    delete ensurePromises[userId]
  }
}
