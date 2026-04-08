routerAdd('POST', '/backend/v1/process-reminders', (e) => {
  const now = new Date()
  let processed = 0

  const settings = $app.findRecordsByFilter('user_settings', 'reminders_enabled = true', '', 0, 0)

  for (const setting of settings) {
    const leadTimeMins = setting.get('reminder_lead_time') || 15
    const userId = setting.get('user')

    const thresholdTime = new Date(now.getTime() + leadTimeMins * 60000)
    const nowStr = now.toISOString().replace('T', ' ').substring(0, 19) + 'Z'
    const thresholdStr = thresholdTime.toISOString().replace('T', ' ').substring(0, 19) + 'Z'

    try {
      const tasks = $app.findRecordsByFilter(
        'tasks',
        "owner = {:userId} && status != 'completed' && deadline >= {:now} && deadline <= {:threshold}",
        '',
        0,
        0,
        { userId, now: nowStr, threshold: thresholdStr },
      )

      for (const task of tasks) {
        try {
          $http.send({
            url: 'http://127.0.0.1:8090/backend/v1/webhook/whatsapp',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              contactName: 'Assistente Pessoal',
              message: `⏰ Lembrete Automático: A tarefa "${task.get('title')}" vence em breve!`,
            }),
            timeout: 5,
          })
          processed++
        } catch (err) {
          console.log('Failed to send webhook for task', task.get('id'))
        }
      }
    } catch (err) {
      console.log('Error finding tasks for user', userId, err)
    }
  }

  return e.json(200, { success: true, processed })
})
