routerAdd('POST', '/backend/v1/webhook/whatsapp', (e) => {
  const body = e.requestInfo().body
  const userId = body.userId
  const contactName = body.contactName
  const message = body.message

  if (!userId || !contactName || !message) {
    return e.json(400, { error: 'Missing required fields' })
  }

  let chat
  try {
    chat = $app.findFirstRecordByFilter('chats', 'owner = {:userId} && name = {:contactName}', {
      userId,
      contactName,
    })
    chat.set('last_message', message)
    chat.set('updated', new Date().toISOString())
    $app.save(chat)
  } catch (err) {
    const chatsCollection = $app.findCollectionByNameOrId('chats')
    chat = new Record(chatsCollection)
    chat.set('name', contactName)
    chat.set('last_message', message)
    chat.set('owner', userId)
    chat.set('priority', 'medium')
    $app.save(chat)
  }

  const lowerMsg = message.toLowerCase()
  const isTask =
    lowerMsg.includes('preciso') ||
    lowerMsg.includes('fazer') ||
    lowerMsg.includes('comprar') ||
    lowerMsg.includes('lembrar') ||
    lowerMsg.includes('tarefa')

  if (isTask) {
    const tasksCollection = $app.findCollectionByNameOrId('tasks')
    const task = new Record(tasksCollection)
    task.set('title', 'Tarefa Detectada: ' + contactName)
    task.set('description', message)
    task.set('status', 'detected')
    task.set('chat', chat.id)
    task.set('owner', userId)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    task.set('deadline', tomorrow.toISOString())

    $app.save(task)
  }

  return e.json(200, { success: true, chat: chat.id })
})
