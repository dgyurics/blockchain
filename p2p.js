'use strict';

let WebSocket = require('ws');

const p2p_port = process.env.P2P_PORT || 6001;

const message_types = Object.freeze({GET_LATEST_BLOCK: 0, GET_ALL_BLOCKS: 1, BROADCAST_BLOCK: 2});

let sockets = [];

/* initialize websocket server */
function init() {
  let server = new WebSocket.Server({port: p2p_port});
  console.log('p2p port: ' + p2p_port);
  server.on('connection', ws => newConnectionHandler(ws));
}

/* executed each time a new client connects */
function newConnectionHandler(ws) {
  console.log('connection opened');
  sockets.push(ws);

  messageHandler(ws);
  exitHandler(ws);
  errorHandler(ws);
}

/* executed each time a message is received */
function messageHandler(ws) {
  ws.on('message', (data) => {
    let message = JSON.parse(data);

    switch (message.type) {
      case message_types.GET_LATEST_BLOCK:
        console.log('sending latest block')
        break;
      case message_types.GET_ALL_BLOCKS:
        console.log('sending block chain')
        break;
      case message_types.BROADCAST_BLOCK:
        console.log('received new block(s)')
        break;
      default:
        console.log('unrecognized message type')
        break;
    }
  });
}

/* executed when a connection is closed */
function exitHandler(ws) {
  ws.on('close', () => {
    sockets.splice(sockets.indexOf(ws), 1);
    console.log('connection closed');
  })
}

/* executed when a connection error occurs */
function errorHandler(ws) {
  ws.on('error', () => {
    sockets.splice(sockets.indexOf(ws), 1);
    console.error('connection closed');
  })
}

function connectToPeers(newPeers) {
  newPeers.forEach((newPeer) => {
    let ws = new WebSocket(newPeer);

    ws.on('open', () => {
      sockets.push(ws);
      messageHandler(ws);
      exitHandler(ws);
      errorHandler(ws);
    });
  })
};

/* broadcast message to all peers */
function broadcast(message) {
  sockets.forEach(socket => {
    socket.send(JSON.stringify(message));
  });
}

function broadcastBlock(block) {
  let message = {
    'type': message_types.BROADCAST_BLOCK,
    'data': [block]
  };
  broadcast(message);
}

module.exports.message_types = message_types;
module.exports.broadcastBlock = broadcastBlock;
module.exports.connectToPeers = connectToPeers;
module.exports.init = init;
module.exports.sockets = sockets;
