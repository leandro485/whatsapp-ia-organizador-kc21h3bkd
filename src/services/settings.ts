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

// Module-level lock to prevent concurrent initialization requests
let ensurePromise: Promise<any> | null = null

export const ensureUserSettings = async (userId: string) => {
  // If a request is already in flight, return the same promise to ensure idempotency
  if (ensurePromise) {
    return ensurePromise
  }

  ensurePromise = (async () => {
    // Exact schema alignment for payload
    const defaultSettings = {
      user: userId,
      whatsapp_connected: false,
      ai_aggressiveness: 50,
      categories: ['Trabalho', 'Família', 'Financeiro', 'Vendas'],
      reminders_enabled: true,
      reminder_lead_time: 15,
    }

    try {
      // 1. Check before create
      const existing = await getUserSettings(userId)
      if (existing) return existing

      try {
        // 2. Conditional creation with validated payload
        return await createUserSettings(defaultSettings)
      } catch (createError) {
        // Handle potential race condition where another concurrent request created it first
        console.warn('Failed to create settings, checking for concurrent creation...', createError)
        const concurrentExisting = await getUserSettings(userId)
        if (concurrentExisting) return concurrentExisting

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
    const result = await ensurePromise
    return result
  } finally {
    // Clear lock after resolution
    ensurePromise = null
  }
}
