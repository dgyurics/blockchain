'use strict';

let SHA256 = require('crypto-js/sha256');
let p2p = require('./p2p');
let http = require('./rest');

let blockchain = []; // in-memory blockchain
let difficulty = 4; // number of leading 0s required when mining new block

class Block {
  constructor(index, previousHash, timestamp, data, hash, nonce = 0) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.nonce = nonce;
  }
}

const genesisBlock = new Block(0, '0', 1514173032339, 'genesis block', '4B2FF30F85015FE5B0FC1E6408D8A8FF868BF4DF8C4E4422967F46A7CFC9A515');

function calculateHash(index, previousHash, timestamp, data, nonce) {
  return SHA256(index + previousHash + timestamp + data + nonce).toString();
}

function calculateBlockHash(block) {
  return calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce);
}

function getTimeStamp() {
  return new Date().getTime();
}

function generateBlock(blockData) {
  let nonce = 0;
  let previousBlock = getLatestBlock(blockchain);
  let nextIndex = previousBlock.index + 1;
  let timestamp = getTimeStamp();
  let nextHash = calculateHash(nextIndex, previousBlock.hash, timestamp, blockData, nonce);

  // perform proof of work aka mining
  while (!isValidHash(nextHash, difficulty)) {
    nonce++;
    nextHash = calculateHash(nextIndex, previousBlock.hash, timestamp, blockData, nonce);
  }

  console.log('block mined: ' + nextHash);

  return new Block(nextIndex, previousBlock.hash, timestamp, blockData, nextHash, nonce);
}

function isValidHash(hashString, difficulty) {
  return hashString.substring(0, difficulty) == Array(difficulty + 1).join('0');
}

function getLatestBlock(chain) {
  return chain[chain.length - 1];
}

function isValidNewBlock(newBlock, previousBlock) {
  if (previousBlock.index + 1 !== newBlock.index)
    return false;
  if (previousBlock.hash !== newBlock.previousHash)
    return false;
  if (calculateBlockHash(newBlock) !== newBlock.hash)
    return false;
  if (!isValidHash(newBlock.hash, difficulty))
    return false;

  return true;
}

function handleBlockchainSync(chain) {
  let receivedBlocks = chain.sort((a, b) => (a.index - b.index));
  let latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  let currentLatestBlock = getLatestBlock(blockchain);

  // only take action if current blockchain is behind received blockchain
  if (latestBlockReceived.index > currentLatestBlock.index) {

    if (latestBlockReceived.previousHash === currentLatestBlock.hash) {

      // TODO convert into function (multiple nested if statements == bad)
      if (isValidNewBlock(latestBlockReceived, getLatestBlock(blockchain))) {
        blockchain.push(latestBlockReceived);
        p2p.broadcastBlock(latestBlockReceived);
      }

    } else if (chain.length === 1) {
      p2p.requestAllBlocks();
    } else if (chain.length > blockchain.length && isValidChain(chain)) {
      blockchain = chain;
      p2p.broadcastBlock(getLatestBlock(blockchain));
    }
  }
}

function getBlockchain() {
  return blockchain;
}

function isValidChain(chain) {
  // validate genesis block
  if (JSON.stringify(chain[0]) !== JSON.stringify(genesisBlock)) {
    return false;
  }

  // validate remaining blocks
  let tempBlocks = [chain[0]];

  for (let i = 1; i < chain.length; i++) {
    if (isValidNewBlock(chain[i], tempBlocks[i - 1]))
      tempBlocks.push(chain[i]);
    else
      return false;
  }
  return true;
}

function addBlock(newBlock) {
  if (isValidNewBlock(newBlock, getLatestBlock(blockchain))) {
    blockchain.push(newBlock);
    p2p.broadcastBlock(newBlock);
  }
}

function replaceChain(newBlocks) {
  // currently checking for longest chain, however this should be chain with most work
  if (isValidChain(newBlocks) && newBlocks.length > blockchain.length)
    blockchain = newBlocks;
  else
    console.error('invalid block chain received');
};

blockchain.push(genesisBlock);
p2p.init();
http.init();

module.exports.blockchain = blockchain;
module.exports.generateBlock = generateBlock;
module.exports.addBlock = addBlock;
module.exports.handleBlockchainSync = handleBlockchainSync;
module.exports.getBlockchain = getBlockchain;
