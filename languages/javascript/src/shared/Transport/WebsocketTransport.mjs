const MAX_QUEUED_MESSAGES = 100

export default class WebsocketTransport {
  constructor (endpoint) {
    this._endpoint = endpoint
    this._ws = null
    this._connected = false
    this._queue = []
    this._callbacks = []
  }

  send (json) {
    this._connect()

    if (this._connected) {
      this._ws.send(JSON.stringify(json))
    } else {
      if (this._queue.length < MAX_QUEUED_MESSAGES) {
        this._queue.push(json)
      }
    }
  }

  receive (callback) {
    if (!callback) return
    this._connect()
    this._callbacks.push(callback)
  }

  _notifyCallbacks (message) {
    for (let i = 0; i < this._callbacks.length; i++) {
      setTimeout(() => this._callbacks[i](message), 1)
    }
  }

  _connect () {
    if (this._ws) return
    this._ws = new WebSocket(this._endpoint, ['jsonrpc'])
    this._ws.addEventListener('message', message => {
      this._notifyCallbacks(JSON.parse(message.data))
    })
    this._ws.addEventListener('error', message => {
    })
    this._ws.addEventListener('close', message => {
      this._ws = null
      this._connected = false
    })
    this._ws.addEventListener('open', message => {
      this._connected = true
      for (let i = 0; i < this._queue.length; i++) {
        this._ws.send(this._queue[i])
      }
      this._queue = []
    })
  }
}