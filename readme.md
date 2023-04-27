## Blockchain Project Readme

This project is a basic implementation of a blockchain written in JavaScript. It includes functionality for creating and mining new blocks, broadcasting blocks to other nodes in a peer-to-peer network, and validating new blocks received from other nodes.

### Installation

This project requires Node.js to run. Clone the repository, navigate to the root directory, and run the following command to install the required dependencies:

```
npm install
```

### Usage

To start the project, run the following command:

```
npm start
```

This will start a local server at http://localhost:3001 where you can interact with the blockchain via HTTP requests. The following endpoints are available:

- GET `/blocks`: returns the full blockchain as an array of block objects
- POST `/blocks`: creates and mines a new block with the provided data and adds it to the blockchain
- POST `/peers`: adds a new peer node to the network
- GET `/peers`: returns the current list of peer nodes in the network

In addition to the HTTP server, the project also includes a peer-to-peer networking layer implemented via WebSockets. When the project is started, it will attempt to connect to any existing nodes in the network and synchronize its blockchain with the longest chain in the network. 

### License

This project is licensed under the MIT License. See the LICENSE file for details.
