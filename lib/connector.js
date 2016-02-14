'use strict';

const Abstract = require('@scola/websocket');

class ServerConnector extends Abstract.Connector {
  constructor(pool, connection, message, filters, websocket) {
    super(pool, connection, message);

    this.filters = (filters || []).map((filter) => {
      return filter.get();
    });

    this.webSocketFactory = websocket;
    this.options = {};
    this.server = null;
  }

  bind(options) {
    this.open();

    options = options || {};
    options.headers = options.headers || [];
    options.verifyClient = this.verifyClient.bind(this);

    this.options = options;
    this.server = this.webSocketFactory.create(options);
    this.addServerHandlers();

    return this;
  }

  release() {
    this.removeServerHandlers();
    this.server.close();

    return this;
  }

  verifyClient(info, callback) {
    this.filters
      .reduce((promise, filter) => {
        return promise.then(() => filter.receive(info));
      }, Promise.resolve())
      .then(() => {
        callback(true);
      })
      .catch((error) => {
        callback(false, error.message.slice(0, 3));
        this.handleError(error);
      });
  }

  addServerHandlers() {
    this.bindListener('connection', this.server, this.handleConnection);
    this.bindListener('error', this.server, this.handleError);
    this.bindListener('headers', this.server, this.handleHeaders);
  }

  removeServerHandlers() {
    this.unbindListener('connection', this.server, this.handleConnection);
    this.unbindListener('error', this.server, this.handleError);
    this.unbindListener('headers', this.server, this.handleHeaders);
  }

  handleConnection(connection) {
    try {
      this.connectionProvider
        .get()
        .connect(connection);
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    this.emit('error', {
      error
    });
  }

  handleHeaders(headers) {
    this.options.headers.forEach((header) => {
      headers.push(header);
    });
  }
}

module.exports = ServerConnector;
