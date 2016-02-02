'use strict';

const Abstract = require('@scola/websocket');

class PushSocket extends Abstract.Socket {
  constructor(loadBalancer) {
    super();
    this.loadBalancer = loadBalancer;
  }

  send(message) {
    this.loadBalancer.send(message);
    return this;
  }

  handleMessage() {}
}

module.exports = PushSocket;
