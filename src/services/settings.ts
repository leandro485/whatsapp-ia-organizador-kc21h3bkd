import pb from '@/lib/pocketbase/client'

export const getUserSettings = async (userId: string) => {
  try {
    const records = await pb.collection('user_settings').getFullList({ filter: `user="${userId}"` })
    return records[0] || null
  } catch (error) {
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

export const ensureUserSettings = async (userId: string) => {
  const defaultSettings = {
    user: userId,
    whatsapp_connected: false,
    ai_aggressiveness: 50,
    categories: ['Trabalho', 'Família', 'Financeiro', 'Vendas'],
    reminders_enabled: true,
    reminder_lead_time: 15,
  }

  try {
    const existing = await getUserSettings(userId)
    if (existing) return existing

    // Idempotent creation with valid defaults mapped to schema
    return await createUserSettings(defaultSettings)
  } catch (error) {
    console.error('Failed to ensure user settings. Using local defaults.', error)
    return {
      id: 'local-default',
      ...defaultSettings,
    }
  }
}
