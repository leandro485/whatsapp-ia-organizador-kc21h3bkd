routerAdd(
  'POST',
  '/backend/v1/whatsapp_disconnect',
  (e) => {
    // Em um cenário real, isso enviaria o comando de desconexão para o gateway
    // para encerrar a sessão do WhatsApp ativa.
    return e.json(200, { success: true, message: 'Sessão do WhatsApp encerrada com sucesso.' })
  },
  $apis.requireAuth(),
)
