// Lightweight WebSocket client for /ws/quotes
// Usage:
//   const client = createQuoteWS(['AAPL', 'MSFT'], { intervalSec: 1 })
//   client.onMessage((quotes) => { /* quotes: Array<QuoteDto> */ })
//   client.connect()

function buildWsUrl(tickers, intervalSec) {
  const list = Array.isArray(tickers)
    ? tickers
    : String(tickers || '').split(',').map(s => s.trim()).filter(Boolean)
  const params = new URLSearchParams()
  if (list.length > 0) {
    params.set('tickers', list.join(','))
  }
  if (intervalSec) {
    params.set('intervalSec', String(intervalSec))
  }
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const base = `${protocol}://${location.host}`
  return `${base}/ws/quotes?${params.toString()}`
}

export function createQuoteWS(tickers, options = {}) {
  const { intervalSec = 1, maxReconnectDelayMs = 10000 } = options
  let ws = null
  let url = buildWsUrl(tickers, intervalSec)
  let reconnectAttempts = 0
  let closedByUser = false
  let onMessageHandler = null
  let onOpenHandler = null
  let onCloseHandler = null
  let onErrorHandler = null

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return
    }
    closedByUser = false
    ws = new WebSocket(url)

    ws.onopen = () => {
      reconnectAttempts = 0
      onOpenHandler && onOpenHandler()
    }

    ws.onmessage = (event) => {
      const data = event.data
      // tolerate non-JSON heartbeats or text
      try {
        const parsed = JSON.parse(data)
        // Finnhub relay: { type, data: [...] }
        if (Array.isArray(parsed?.data) && parsed?.type) {
          onMessageHandler && onMessageHandler(parsed.data)
          return
        }
        // Server single object: normalize to array
        if (parsed && typeof parsed === 'object') {
          onMessageHandler && onMessageHandler([parsed])
          return
        }
        // Already an array
        if (Array.isArray(parsed)) {
          onMessageHandler && onMessageHandler(parsed)
        }
      } catch (e) {
        // ignore non-JSON (e.g., heartbeat)
      }
    }

    ws.onerror = (err) => {
      onErrorHandler && onErrorHandler(err)
    }

    ws.onclose = () => {
      onCloseHandler && onCloseHandler()
      if (!closedByUser) {
        scheduleReconnect()
      }
    }
  }

  function scheduleReconnect() {
    reconnectAttempts += 1
    const delay = Math.min(250 * Math.pow(2, reconnectAttempts), maxReconnectDelayMs)
    setTimeout(() => {
      connect()
    }, delay)
  }

  function close() {
    closedByUser = true
    if (ws) {
      try { ws.close() } catch (_) {}
    }
  }

  function onMessage(handler) { onMessageHandler = handler; return api }
  function onOpen(handler) { onOpenHandler = handler; return api }
  function onClose(handler) { onCloseHandler = handler; return api }
  function onError(handler) { onErrorHandler = handler; return api }

  function resubscribe(newTickers, newOptions = {}) {
    const nextInterval = newOptions.intervalSec ?? intervalSec
    url = buildWsUrl(newTickers, nextInterval)
    closedByUser = false
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.close() } catch (_) {}
    }
    connect()
  }

  const api = {
    connect,
    close,
    onMessage,
    onOpen,
    onClose,
    onError,
    resubscribe
  }

  return api
}


