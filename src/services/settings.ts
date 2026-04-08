import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'

export const getUserSettings = async (userId: string) => {
  try {
    return await pb.collection('user_settings').getFirstListItem(`user="${userId}"`)
  } catch (error: any) {
    if (error?.status === 404) {
      return null
    }
    console.error('Error fetching user settings:', error)
    throw error
  }
}

export const updateUserSettings = async (id: string, data: any) => {
  return pb.collection('user_settings').update(id, data)
}

export const createUserSettings = async (data: any) => {
  const currentUserId = pb.authStore.record?.id || data.user
  const payload = {
    ...data,
    user: currentUserId,
  }
  return pb.collection('user_settings').create(payload)
}

const ensurePromises: Record<string, Promise<any>> = {}

export const ensureUserSettings = async (userId: string) => {
  const currentUserId = pb.authStore.record?.id || userId
  if (!currentUserId) {
    console.warn('User ID is required to ensure settings')
    return null
  }

  if (ensurePromises[currentUserId]) {
    return ensurePromises[currentUserId]
  }

  ensurePromises[currentUserId] = (async () => {
    const defaultSettings = {
      user: currentUserId,
      whatsapp_connected: false,
      ai_aggressiveness: 50,
      categories: ['Trabalho', 'Família', 'Financeiro', 'Vendas'],
      reminders_enabled: false,
      reminder_lead_time: 30,
    }

    try {
      const existing = await getUserSettings(currentUserId)

      if (existing) {
        return existing
      }

      try {
        return await createUserSettings(defaultSettings)
      } catch (createError: any) {
        console.warn(
          'Failed to create settings, checking for concurrent creation...',
          createError instanceof ClientResponseError ? createError.response : createError,
        )
        try {
          const concurrentExisting = await getUserSettings(currentUserId)
          if (concurrentExisting) return concurrentExisting
        } catch (fallbackError) {
          console.warn('Fallback fetch also failed', fallbackError)
        }

        console.error('Failed to create or fetch user settings. Using local defaults.')
        return {
          id: 'local-default',
          ...defaultSettings,
        }
      }
    } catch (error) {
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
    delete ensurePromises[currentUserId]
  }
}
