'use strict';

const Abstract = require('@scola/websocket');

class ServerConnection extends Abstract.Connection {
  constructor(pool, message, filters) {
    super(pool, message, filters);
    this.identity = null;
  }

  getIdentity() {
    return this.identity;
  }

  setIdentity(identity) {
    this.identity = identity;
    return this;
  }

  connect(connection) {
    if (connection.upgradeReq.scolaIdentity) {
      this.identity = connection.upgradeReq.scolaIdentity;
      delete connection.upgradeReq.scolaIdentity;
    }

    if (connection.upgradeReq.scolaConnectionId) {
      this.id = connection.upgradeReq.scolaConnectionId;
      delete connection.upgradeReq.scolaConnectionId;
    }

    this.handleOpen(connection);

    return this;
  }
}

module.exports = ServerConnection;
