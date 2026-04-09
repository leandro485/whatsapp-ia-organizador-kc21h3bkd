routerAdd(
  'GET',
  '/backend/v1/whatsapp/qr',
  (e) => {
    const instanceId = ($secrets.get('ZAPI_INSTANCE_ID') || '').trim()
    const token = ($secrets.get('ZAPI_TOKEN') || '').trim()

    if (!instanceId || !token) {
      throw new BadRequestError('Z-API credentials missing')
    }

    const res = $http.send({
      url: 'https://api.z-api.io/instances/' + instanceId + '/token/' + token + '/qr-code',
      method: 'GET',
    })

    if (res.statusCode !== 200) {
      if (res.statusCode === 400) {
        throw new BadRequestError('ZAPI_400')
      }
      throw new BadRequestError('Failed to fetch QR code from Z-API: ' + res.statusCode)
    }

    const qrData = res.json.value || res.json.qr || ''
    return e.json(200, { qr: qrData })
  },
  $apis.requireAuth(),
)
