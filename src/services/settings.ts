import pb from '@/lib/pocketbase/client'

export const getUserSettings = async (userId: string) => {
  const records = await pb.collection('user_settings').getFullList({ filter: `user="${userId}"` })
  return records[0]
}

export const updateUserSettings = async (id: string, data: any) => {
  return pb.collection('user_settings').update(id, data)
}

export const createUserSettings = async (data: any) => {
  return pb.collection('user_settings').create(data)
}
