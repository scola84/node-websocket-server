'use strict';

const Abstract = require('@scola/websocket');

class PubSocket extends Abstract.Socket {
  constructor() {
    super();

    this.defaultTopic = '*';
    this.topicDelimiter = '=';
    this.subscriptions = {};
  }

  setDefaultTopic(topic) {
    this.defaultTopic = topic;
  }

  setTopicDelimiter(topicDelimiter) {
    this.topicDelimiter = topicDelimiter;
  }

  send(message) {
    const topic = String(message.sliceHead()) || this.defaultTopic;
    const connections = this.getConnections(topic);

    let connection = null;

    for (connection of connections) {
      if (connection.canSend()) {
        connection.send(message);
      }
    }

    return this;
  }

  handleMessage(event) {
    const [topic, action] = String(event.message.sliceHead())
      .split(this.topicDelimiter);

    event.topic = topic;

    if (action === '1') {
      this.handleSubscribe(event);
    } else if (action === '0') {
      this.handleUnsubscribe(event);
    }

    this.emit('message', event);
  }

  handleSubscribe(event) {
    this.subscriptions[event.topic] = this.subscriptions[event.topic] || [];

    if (this.subscriptions[event.topic].indexOf(event.connection) === -1) {
      this.subscriptions[event.topic].push(event.connection);
      this.emit('subscribe', event);
    }
  }

  handleUnsubscribe(topic, event) {
    if (this.subscriptions[event.topic]) {
      const index = this.subscriptions[event.topic].indexOf(event.connection);

      if (index !== -1) {
        this.subscriptions[event.topic].splice(index, 1);
        this.emit('subscribe', event);
      }
    }
  }

  getConnections(topic) {
    let connections = this.subscriptions[topic] || [];

    if (topic !== this.defaultTopic) {
      connections = connections.concat(
        this.subscriptions[this.defaultTopic] || []
      );
    }

    return connections;
  }
}

module.exports = PubSocket;
