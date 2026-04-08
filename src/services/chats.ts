import pb from '@/lib/pocketbase/client'

export const getChats = () => pb.collection('chats').getFullList({ sort: '-pinned,-updated' })
export const updateChatPinned = (id: string, pinned: boolean) =>
  pb.collection('chats').update(id, { pinned })
