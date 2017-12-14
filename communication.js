'use strict';

let WebSocket = require('ws');

const http_port = process.env.HTTP_PORT || 3001;
const p2p_port = process.env.P2P_PORT || 6001;

function init() {
  console.log('http port: ' + http_port);
  console.log('p2p port: ' + p2p_port);
}

module.exports.init = init;
