class NotYetImplementedError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'NotYetImplementedError';
  }
}

class IllegalStateError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'IllegalStateError';
  }
}

class WebSocketError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'WebSocketError';
  }
}

module.exports.NotYetImplementedError = NotYetImplementedError;
module.exports.IllegalStateError = IllegalStateError;
module.exports.WebSocketError = WebSocketError;
