migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const user = new Record(users)
    user.setEmail('leandro@lelusacolas.com.br')
    user.setPassword('securepassword123')
    user.setVerified(true)
    app.save(user)

    const chats = app.findCollectionByNameOrId('chats')
    const chat1 = new Record(chats)
    chat1.set('name', 'Carlos (Tech Lead)')
    chat1.set(
      'last_message',
      'A API de pagamentos está falhando em produção, preciso de um hotfix urgente.',
    )
    chat1.set('priority', 'high')
    chat1.set('summary', 'Falha crítica na API de pagamentos\nNecessário deploy de hotfix urgente')
    chat1.set('owner', user.id)
    app.save(chat1)

    const chat2 = new Record(chats)
    chat2.set('name', 'Cliente XPTO')
    chat2.set('last_message', 'Podemos agendar a reunião de kickoff para amanhã às 14h?')
    chat2.set('priority', 'medium')
    chat2.set('summary', 'Cliente solicitou reunião de kickoff\nSugerido amanhã às 14h')
    chat2.set('owner', user.id)
    app.save(chat2)

    const tasks = app.findCollectionByNameOrId('tasks')
    const task1 = new Record(tasks)
    task1.set('title', 'Investigar falha na API')
    task1.set('description', 'A API de pagamentos está falhando...')
    task1.set('status', 'in_progress')
    task1.set('deadline', new Date().toISOString().replace('T', ' '))
    task1.set('chat', chat1.id)
    task1.set('owner', user.id)
    app.save(task1)

    const task2 = new Record(tasks)
    task2.set('title', 'Enviar invite de Kickoff')
    task2.set('description', 'Podemos agendar a reunião...')
    task2.set('status', 'detected')
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    task2.set('deadline', tomorrow.toISOString().replace('T', ' '))
    task2.set('chat', chat2.id)
    task2.set('owner', user.id)
    app.save(task2)

    const settings = app.findCollectionByNameOrId('user_settings')
    const setting1 = new Record(settings)
    setting1.set('whatsapp_connected', true)
    setting1.set('ai_aggressiveness', 70)
    setting1.set('categories', ['Trabalho', 'Família', 'Financeiro', 'Vendas'])
    setting1.set('user', user.id)
    app.save(setting1)
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'leandro@lelusacolas.com.br')

      const settings = app.findRecordsByFilter('user_settings', `user = '${user.id}'`, '', 100, 0)
      settings.forEach((s) => app.delete(s))

      const tasks = app.findRecordsByFilter('tasks', `owner = '${user.id}'`, '', 100, 0)
      tasks.forEach((t) => app.delete(t))

      const chats = app.findRecordsByFilter('chats', `owner = '${user.id}'`, '', 100, 0)
      chats.forEach((c) => app.delete(c))

      app.delete(user)
    } catch (_) {}
  },
)
