'use strict';

let SHA256 = require("crypto-js/sha256");
let communication = require("./communication");

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
  return calculateHash(block.index, block.previousHash, block.timeStamp, block.data);
}

function getTimeStamp() {
  return new Date().getTime();
}

function generateBlock(blockData) {
  let previousBlock = getLatestBlock();
  let nextIndex = previousBlock.index + 1;
  let timeStamp = getTimeStamp();
  let nextHash = calculateHash(nextIndex, previousBlock.hash, timeStamp, blockData);

  return new Block(nextIndex, previousBlock.hash, timeStamp, blockData, nextHash);
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

function replaceChain(newBlocks) {
    // currently checking for longest chain, however this should be chain with most work
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        blockchain = newBlocks;
        // broadcast that chain has been updated
    }
};

blockchain.push(genesisBlock);
communication.init();
