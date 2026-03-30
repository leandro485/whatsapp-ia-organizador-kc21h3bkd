import pb from '@/lib/pocketbase/client'

export const getTasks = async () => {
  return pb.collection('tasks').getFullList({ sort: '-created', expand: 'chat' })
}

export const updateTaskStatus = async (id: string, status: string) => {
  return pb.collection('tasks').update(id, { status })
}
