routerAdd(
  'POST',
  '/backend/v1/whatsapp/disconnect',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    const userId = e.auth ? e.auth.id : null
    const disconnectLocal = () => {
      if (userId) {
        try {
          const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
          settings.set('whatsapp_connected', false)
          $app.save(settings)
        } catch (err) {
          // Ignored
        }
      }
    }

    if (!instanceId || !token) {
      disconnectLocal()
      return e.json(200, {
        success: true,
        message: 'Sessão limpa localmente. Configuração da Z-API ausente.',
      })
    }

    let externalSuccess = true
    try {
      const res = $http.send({
        url: 'https://api.z-api.io/instances/' + instanceId + '/token/' + token + '/disconnect',
        method: 'GET',
      })
      if (res.statusCode !== 200) {
        externalSuccess = false
      }
    } catch (err) {
      externalSuccess = false
    }

    disconnectLocal()

    return e.json(200, {
      success: true,
      message: externalSuccess
        ? 'Sessão do WhatsApp encerrada com sucesso.'
        : 'Sessão limpa localmente. Falha ao acessar Gateway.',
    })
  },
  $apis.requireAuth(),
)
