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
  const payload = {
    ...data,
    user: pb.authStore.record?.id || data.user,
  }
  return pb.collection('user_settings').create(payload)
}

const ensurePromises: Record<string, Promise<any>> = {}

export const ensureUserSettings = async (userId: string) => {
  const currentUserId = pb.authStore.record?.id || userId
  if (!currentUserId) {
    throw new Error('User ID is required to ensure settings')
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
