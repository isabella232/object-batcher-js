'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

const ObjectBatcher = require('../index.js');
const primaryKey = 1;
const primaryKey2 = 2;

const options = {
  batchTimeout: 10000,
  batchSize: 10
};

describe('ObjectBatcher', function() {
  beforeEach(function() {
    // eslint-disable-next-line no-undef
    this.clock = sinon.useFakeTimers();
    this.batches = [];
    this.callback = (primaryKey, data) => {
      this.batches.push({ primaryKey, data });
    };

    this.objectBatcher = new ObjectBatcher(this.callback, options);
  });

  afterEach(function() {
    this.clock.restore();
  });

  describe('add', function() {
    it('should call callback when batch size reached 10', function() {
      for (var i = 0; i < 10; i++) {
        this.objectBatcher.add(primaryKey, { foo: i });
      }

      expect(this.batches.length).to.eql(1);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(10);
      expect(this.batches[0].data[5]).to.eql({ foo: 5 });
    });

    it('should call callback twice with proper data', function() {
      for (var i = 0; i < 21; i++) {
        this.objectBatcher.add(primaryKey, { foo: i });
      }

      expect(this.batches.length).to.eql(2);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(10);
      expect(this.batches[0].data[5]).to.eql({ foo: 5 });

      expect(this.batches[1].primaryKey).to.eql(primaryKey);
      expect(this.batches[1].data.length).to.eql(10);
      expect(this.batches[1].data[5]).to.eql({ foo: 15 });
    });

    it('should call callback twice with proper data', function() {
      for (var i = 0; i < 11; i++) {
        this.objectBatcher.add(primaryKey, { foo: i });
        this.objectBatcher.add(primaryKey2, { bar: i });
      }

      expect(this.batches.length).to.eql(2);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(10);
      expect(this.batches[0].data[5]).to.eql({ foo: 5 });

      expect(this.batches[1].primaryKey).to.eql(primaryKey2);
      expect(this.batches[1].data.length).to.eql(10);
      expect(this.batches[1].data[5]).to.eql({ bar: 5 });
    });

    it("should'nt call callback when batch size is smaller than 10", function() {
      this.objectBatcher.add(primaryKey, { foo: 0 });
      for (var i = 1; i < 10; i++) {
        this.objectBatcher.add(primaryKey, { foo: i });
        this.objectBatcher.add(primaryKey2, { foo: i });
      }

      expect(this.batches.length).to.eql(1);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(10);
      expect(this.batches[0].data[5]).to.eql({ foo: 5 });
    });

    it('should call callback after batch timeout', function() {
      this.objectBatcher.add(primaryKey, { foo: 0 });

      expect(this.batches.length).to.eql(0);

      this.clock.tick(options.batchTimeout);

      expect(this.batches.length).to.eql(1);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(1);
      expect(this.batches[0].data[0]).to.eql({ foo: 0 });
    });

    it('should call callback after batch timeout for multiple primaryKeys', function() {
      this.objectBatcher.add(primaryKey, { foo: 0 });
      this.objectBatcher.add(primaryKey2, { bar: 0 });
      this.objectBatcher.add(primaryKey2, { bar: 1 });

      expect(this.batches.length).to.eql(0);

      this.clock.tick(options.batchTimeout);

      expect(this.batches.length).to.eql(2);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(1);
      expect(this.batches[0].data[0]).to.eql({ foo: 0 });

      expect(this.batches[1].primaryKey).to.eql(primaryKey2);
      expect(this.batches[1].data.length).to.eql(2);
      expect(this.batches[1].data[0]).to.eql({ bar: 0 });
      expect(this.batches[1].data[1]).to.eql({ bar: 1 });
    });

    it("should'nt call callback after batch timeout when batch is empty", function() {
      for (var i = 0; i < 10; i++) {
        this.objectBatcher.add(primaryKey, { foo: i });
      }

      this.clock.tick(options.batchTimeout * 3);

      expect(this.batches.length).to.eql(1);
    });
  });

  describe('resetState', function() {
    it('should not call callback with items added before a resetState', function () {
      this.objectBatcher.add(primaryKey, { before: 'reset' });

      this.objectBatcher.resetState();

      this.objectBatcher.add(primaryKey, { after: 'reset' });
      this.clock.tick(options.batchTimeout);

      expect(this.batches).to.eql([{ primaryKey: 1, data: [{ after: 'reset'}] }])
    });

    it('should reset timeout after a resetState', function () {
      this.clock.tick(options.batchTimeout / 2);

      this.objectBatcher.resetState();
      this.objectBatcher.add(primaryKey, { foo: 0 });

      this.clock.tick(options.batchTimeout / 2);
      expect(this.batches).to.eql([]);

      this.clock.tick(options.batchTimeout / 2);
      expect(this.batches.length).to.eql(1);
    });

    it('should forget list of primaryKeys after reset', function () {
      this.objectBatcher.add(primaryKey, { foo: 0 });

      this.objectBatcher.resetState();
      this.objectBatcher.add(primaryKey2, { foo: 1 });

      this.clock.tick(options.batchTimeout);

      expect(this.batches.length).to.eql(1);
    });
  });
});
