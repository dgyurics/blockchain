'use strict';

let SHA256 = require('crypto-js/sha256');
let p2p = require('./p2p');
let http = require('./rest');

let blockchain = []; // in-memory blockchain

class Block {
  constructor(index, previousHash, timestamp, data, hash) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
  }
}

const genesisBlock = new Block(0, '0', getTimeStamp(), "genesis block", "0");

function calculateHash(index, previousHash, timestamp, data) {
  return SHA256(index + previousHash + timestamp + data).toString();
}

function calculateBlockHash(block) {
  return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
}

function getTimeStamp() {
  return new Date().getTime();
}

function generateBlock(blockData) {
  let previousBlock = getLatestBlock();
  let nextIndex = previousBlock.index + 1;
  let timestamp = getTimeStamp();
  let nextHash = calculateHash(nextIndex, previousBlock.hash, timestamp, blockData);

  return new Block(nextIndex, previousBlock.hash, timestamp, blockData, nextHash);
}

function getLatestBlock() {
  return blockchain[blockchain.length-1];
}

function isValidNewBlock(newBlock, previousBlock) {
  if(previousBlock.index + 1 !== newBlock.index)
    return false;
  if(previousBlock.hash !== newBlock.previousHash)
    return false;
  if(calculateBlockHash(newBlock) !== newBlock.hash)
    return false;

  return true;
}

function isValidChain(chain) {
  // not yet implemented
}

function addBlock(newBlock) {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockchain.push(newBlock);
    p2p.broadcast(newBlock);
  }
}

function replaceChain(newBlocks) {
    // currently checking for longest chain, however this should be chain with most work
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        blockchain = newBlocks;
        // broadcast
    }
};

blockchain.push(genesisBlock);
p2p.init();
http.init();

module.exports.blockchain = blockchain;
module.exports.generateBlock = generateBlock;
module.exports.addBlock = addBlock;
