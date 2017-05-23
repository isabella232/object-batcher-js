'use strict';

class RequestCollector {
  constructor(callback, options = { batchSize: 10, batchTimeout: 10000 }) {
    this._batchSize = options.batchSize;
    this._batchTimeout = options.batchTimeout;

    this._callback = callback;
    this._batches = {};

    this._primaryKeys = [];
    setTimeout(this._flushAll.bind(this), this._batchTimeout);
  }

  add(primaryKey, data) {
    if (typeof this._batches[primaryKey] === 'undefined') {
      this._batches[primaryKey] = [];
      this._primaryKeys.push(primaryKey);
    }

    this._batches[primaryKey].push(data);

    if (this._batches[primaryKey].length >= this._batchSize) {
      this._flush(primaryKey);
    }
  }

  _flush(primaryKey) {
    if (this._batches[primaryKey].length === 0) {
      return;
    }
    this._callback(primaryKey, this._batches[primaryKey]);
    this._batches[primaryKey] = [];
  }

  _flushAll() {
    this._primaryKeys.forEach(this._flush.bind(this));
    setTimeout(this._flushAll.bind(this), this._batchTimeout);
  }
}

module.exports = RequestCollector;
