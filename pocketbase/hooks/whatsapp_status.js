routerAdd(
  'GET',
  '/backend/v1/whatsapp/status',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    const userId = e.auth ? e.auth.id : null

    if (!instanceId || !token) {
      if (userId) {
        try {
          const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
          if (settings.get('whatsapp_connected') !== false) {
            settings.set('whatsapp_connected', false)
            $app.save(settings)
          }
        } catch (err) {}
      }
      return e.json(400, {
        error: 'CREDENTIALS_MISSING',
        message: 'As credenciais ZAPI_TOKEN e ZAPI_INSTANCE_ID não foram encontradas nos Secrets.',
      })
    }

    let res
    try {
      res = $http.send({
        url: `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
        method: 'GET',
      })
    } catch (err) {
      if (userId) {
        try {
          const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
          if (settings.get('whatsapp_connected') !== false) {
            settings.set('whatsapp_connected', false)
            $app.save(settings)
          }
        } catch (err2) {}
      }
      return e.json(200, {
        connected: false,
        status: 'error',
        error: err.message || 'Network error',
      })
    }

    const data = res.json || {}
    const isConnected =
      res.statusCode === 200 ? data.connected || data.status === 'CONNECTED' : false

    if (userId) {
      try {
        const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
        if (settings.get('whatsapp_connected') !== isConnected) {
          settings.set('whatsapp_connected', isConnected)
          $app.save(settings)
        }
      } catch (err) {
        // Ignored
      }
    }

    if (res.statusCode !== 200) {
      return e.json(200, {
        connected: false,
        status: 'error',
        error: 'Falha ao obter status do Z-API: ' + res.statusCode,
        details: data,
      })
    }

    return e.json(200, data)
  },
  $apis.requireAuth(),
)
