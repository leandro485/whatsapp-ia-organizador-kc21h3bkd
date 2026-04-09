routerAdd(
  'GET',
  '/backend/v1/whatsapp/qr',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    if (!instanceId || !token) {
      throw new BadRequestError('your client-token or instance-id is not configured')
    }

    const res = $http.send({
      url: 'https://api.z-api.io/instances/' + instanceId + '/token/' + token + '/qr-code',
      method: 'GET',
    })

    if (res.statusCode !== 200) {
      let errorMsg = 'Falha ao obter QR code do Z-API.'
      try {
        if (res.json && res.json.error) {
          errorMsg = res.json.error
        } else if (res.json && res.json.message) {
          errorMsg = res.json.message
        } else if (res.json) {
          errorMsg = JSON.stringify(res.json)
        }
      } catch (err) {}
      throw new BadRequestError(errorMsg || 'ZAPI Error: ' + res.statusCode)
    }

    const qrData = res.json.value || res.json.qr || ''
    return e.json(200, { qr: qrData })
  },
  $apis.requireAuth(),
)
