'use strict';

let WebSocket = require('ws');

const p2p_port = process.env.P2P_PORT || 6001;

const message_types = Object.freeze({
    GET_LATEST_BLOCK: Symbol('getLatestBlock'),
    GET_ALL_BLOCKS: Symbol('getAllBlocks'),
    BROADCAST_BLOCK: Symbol('broadcastBlock')
});

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

  ws.send('You are now connected to the blockchain');
  sockets.push(ws);

  messageHandler(ws);
  exitHandler(ws);
  errorHandler(ws);
}

/* executed each time a message is sent */
function messageHandler(ws) {
  ws.on('message', (message) => {
    console.log(`message received: ${message}`);
    // not yet implemented
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

/* convert message to string and broadcast to peer */
function write(ws, message) {
  ws.send(JSON.stringify(message));
}

/* broadcast message to all peers */
function broadcast(message) {
  sockets.forEach(socket => {
    write(socket, message);
  });
}

module.exports.message_types = message_types;
module.exports.broadcast = broadcast;
module.exports.connectToPeers = connectToPeers;
module.exports.init = init;
module.exports.sockets = sockets;
