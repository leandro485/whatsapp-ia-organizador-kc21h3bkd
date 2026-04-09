routerAdd(
  'GET',
  '/backend/v1/whatsapp/status',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    if (!instanceId || !token) {
      const userId = e.auth ? e.auth.id : null
      if (userId) {
        try {
          const settings = $app.findFirstRecordByData('user_settings', 'user', userId)
          if (settings.get('whatsapp_connected') !== false) {
            settings.set('whatsapp_connected', false)
            $app.save(settings)
          }
        } catch (err) {}
      }
      throw new BadRequestError('your client-token or instance-id is not configured')
    }

    const res = $http.send({
      url: `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
      method: 'GET',
    })

    const data = res.json || {}
    const isConnected =
      res.statusCode === 200 ? data.connected || data.status === 'CONNECTED' : false

    const userId = e.auth ? e.auth.id : null
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
      throw new BadRequestError('Falha ao obter status do Z-API: ' + res.statusCode)
    }

    return e.json(200, data)
  },
  $apis.requireAuth(),
)
