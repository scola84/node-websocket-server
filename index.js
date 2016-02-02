'use strict';

const WebSocket = require('ws');

const DI = require('@scola/di');
const Helper = require('@scola/websocket-helper');

const Connection = require('./lib/connection');
const Connector = require('./lib/connector');

const Pub = require('./lib/socket/pub');
const Push = require('./lib/socket/push');
const Rep = require('./lib/socket/rep');
const Router = require('./lib/socket/router');

class Module extends DI.Module {
  configure() {
    this.addModule(Helper.Module);

    this.inject(Connection).with(
      this.singleton(Helper.Pool),
      this.provider(Helper.Message),
      this.array([])
    );

    this.inject(Connector).with(
      this.singleton(Helper.Pool),
      this.provider(Connection),
      this.provider(Helper.Message),
      this.array([]),
      this.factory(WebSocket.Server)
    );

    this.inject(Push).with(
      this.singleton(Helper.LoadBalancer)
    );

    this.inject(Router).with(
      this.singleton(Helper.Pool)
    );
  }
}

module.exports = {
  Connection,
  Connector,
  Module,
  Socket: {
    Pub,
    Push,
    Rep,
    Router
  }
};
