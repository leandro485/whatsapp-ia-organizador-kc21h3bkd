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
  // Dynamically populate with current authenticated user's ID to satisfy API rules
  const payload = {
    ...data,
    user: pb.authStore.record?.id || data.user,
  }
  return pb.collection('user_settings').create(payload)
}

// Dictionary lock to prevent concurrent initialization requests per user
const ensurePromises: Record<string, Promise<any>> = {}

export const ensureUserSettings = async (userId: string) => {
  const currentUserId = pb.authStore.record?.id || userId
  if (!currentUserId) {
    throw new Error('User ID is required to ensure settings')
  }

  // If a request is already in flight for this user, return the same promise to ensure idempotency
  if (ensurePromises[currentUserId]) {
    return ensurePromises[currentUserId]
  }

  ensurePromises[currentUserId] = (async () => {
    // Exact schema alignment for full payload consistency
    const defaultSettings = {
      user: currentUserId,
      whatsapp_connected: false,
      ai_aggressiveness: 50,
      categories: ['Trabalho', 'Família', 'Financeiro', 'Vendas'],
      reminders_enabled: true,
      reminder_lead_time: 15,
    }

    try {
      // 1. Pre-creation Check: verify if a record already exists
      const existing = await getUserSettings(currentUserId)

      if (existing) {
        const needsUpdate =
          existing.ai_aggressiveness === undefined ||
          existing.ai_aggressiveness === null ||
          existing.reminders_enabled === undefined ||
          existing.reminders_enabled === null ||
          existing.reminder_lead_time === undefined ||
          existing.reminder_lead_time === null ||
          !Array.isArray(existing.categories) ||
          existing.categories.length === 0

        if (needsUpdate) {
          const updatePayload = {
            ai_aggressiveness: existing.ai_aggressiveness ?? defaultSettings.ai_aggressiveness,
            reminders_enabled: existing.reminders_enabled ?? defaultSettings.reminders_enabled,
            reminder_lead_time: existing.reminder_lead_time ?? defaultSettings.reminder_lead_time,
            categories:
              Array.isArray(existing.categories) && existing.categories.length > 0
                ? existing.categories
                : defaultSettings.categories,
          }
          try {
            return await updateUserSettings(existing.id, updatePayload)
          } catch (updateError) {
            console.error('Failed to update missing default settings', updateError)
            return existing
          }
        }

        return existing
      }

      // 2. Creation with validated payload to avoid HTTP 400
      try {
        return await createUserSettings(defaultSettings)
      } catch (createError) {
        if (createError instanceof ClientResponseError && createError.status === 400) {
          console.warn(
            'Failed to create settings (400), checking for concurrent creation...',
            createError?.response,
          )
          const concurrentExisting = await getUserSettings(currentUserId)
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
    return await ensurePromises[currentUserId]
  } finally {
    // Clear lock after resolution
    delete ensurePromises[currentUserId]
  }
}
