import pb from '@/lib/pocketbase/client'

export const getTasks = () => pb.collection('tasks').getFullList({ sort: '-created' })
