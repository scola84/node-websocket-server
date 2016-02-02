'use strict';

const Abstract = require('@scola/websocket');

class RouterSocket extends Abstract.Socket {
  constructor(pool) {
    super();
    this.connectionPool = pool;
  }

  send(message) {
    const connectionId = String(message.spliceHead());
    const connection = this.connectionPool.get(connectionId);

    if (connection && connection.canSend()) {
      connection.send(message);
    }

    return this;
  }

  handleMessage(event) {
    event.message.addHead(event.connection.getId());
    this.emit('message', event);
  }
}

module.exports = RouterSocket;
