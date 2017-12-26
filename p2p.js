'use strict';

let WebSocket = require('ws');
let blockchain = require('./app');

const p2p_port = process.env.P2P_PORT || 6001;

const message_types = Object.freeze({
  GET_LATEST_BLOCK: 0,
  GET_ALL_BLOCKS: 1,
  BROADCAST_BLOCKS: 2
});

let sockets = [];

/* initialize websocket server */
function init() {
  let server = new WebSocket.Server({
    port: p2p_port
  });
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
      console.log('request for latest block received');
      broadcastBlock(blockchain.blockchain[blockchain.length - 1]);
      break;
    case message_types.GET_ALL_BLOCKS:
      console.log('request for entire blockchain received');
      broadcastBlockchain();
      break;
    case message_types.BROADCAST_BLOCKS:
      console.log('new block(s) received')
      blockchain.handleBlockchainSync(JSON.parse(message.data));
      break;
    default:
      console.error('unrecognized message type')
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
    // skip adding if connection already exists
    if (sockets.find((socket) => socket.url === newPeer))
      return;

    let ws = new WebSocket(newPeer);

    ws.on('open', () => {
      sockets.push(ws);
      messageHandler(ws);
      exitHandler(ws);
      errorHandler(ws);
    });
  })
};

/* send message to peers */
function broadcast(message) {
  sockets.forEach(socket => {
    socket.send(JSON.stringify(message));
  });
}

/* request entire ledger/blockchain from peers */
function requestAllBlocks() {
  broadcast({
    'type': message_types.GET_ALL_BLOCKS
  });
}

/* request the latest block from peers */
function requestLatestBlock() {
  broadcast({
    'type': message_types.GET_LATEST_BLOCK
  });
}

/* send entire blockchain to peers */
function broadcastBlockchain() {
  broadcast({
    'type': message_types.BROADCAST_BLOCKS,
    'data': JSON.stringify(blockchain.blockchain)
  });
}

/* send single block to peers */
function broadcastBlock(block) {
  broadcast({
    'type': message_types.BROADCAST_BLOCKS,
    'data': JSON.stringify([block])
  });
}

module.exports.requestAllBlocks = requestAllBlocks;
module.exports.broadcastBlockchain = broadcastBlockchain;
module.exports.broadcastBlock = broadcastBlock;
module.exports.connectToPeers = connectToPeers;
module.exports.init = init;
module.exports.sockets = sockets;
