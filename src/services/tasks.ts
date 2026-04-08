import pb from '@/lib/pocketbase/client'

export const getTasks = () => pb.collection('tasks').getFullList({ sort: '-created' })
export const updateTaskStatus = (id: string, status: string) =>
  pb.collection('tasks').update(id, { status })
