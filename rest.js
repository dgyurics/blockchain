'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let blockchain = require('./app');
let p2p = require('./p2p');

const http_port = process.env.HTTP_PORT || 3001;

function init() {
  let app = express();
  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    res.send('welcome');
  });

  app.get('/blocks', (req, res) => {
    res.send(JSON.stringify(blockchain.getBlockchain()))
  });

  app.post('/mineBlock', (req, res) => {
    let newBlock = blockchain.generateBlock(req.body.data);
    blockchain.addBlock(newBlock);
    res.send();
  });

  app.get('/peers', (req, res) => {
    res.send(p2p.sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
  });

  app.post('/addPeer', (req, res) => {
    p2p.connectToPeers(req.body);
    res.send();
  });

  app.listen(http_port, () => console.log('http port: ' + http_port));
};

module.exports.init = init;
