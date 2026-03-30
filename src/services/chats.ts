import pb from '@/lib/pocketbase/client'

export const getChats = async () => {
  return pb.collection('chats').getFullList({ sort: '-updated' })
}
