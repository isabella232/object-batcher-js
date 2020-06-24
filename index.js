'use strict';

class ObjectBatcher {
  constructor(callback, options = { batchSize: 10, batchTimeout: 10000 }) {
    this._batchSize = options.batchSize;
    this._batchTimeout = options.batchTimeout;

    this._callback = callback;
    this._batches = {};

    this._primaryKeys = [];
    this._timeoutId = setTimeout(this._flushAll.bind(this), this._batchTimeout);
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

  resetState() {
    this._batches = {};
    this._primaryKeys = [];
    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(this._flushAll.bind(this), this._batchTimeout);
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
    this._timeoutId = setTimeout(this._flushAll.bind(this), this._batchTimeout);
  }
}

module.exports = ObjectBatcher;
