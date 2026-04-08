import pb from '@/lib/pocketbase/client'

export const getChats = () => pb.collection('chats').getFullList({ sort: '-updated' })
