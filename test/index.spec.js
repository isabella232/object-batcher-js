'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

const RequestCollector = require('../index.js');
const primaryKey = 1;
const primaryKey2 = 2;

const options = {
  batchTimeout: 10000,
  batchSize: 10
};

describe('RequestCollector', function() {
  describe('add', function() {
    beforeEach(function() {
      // eslint-disable-next-line no-undef
      this.clock = sinon.useFakeTimers();
      this.batches = [];
      this.callback = (primaryKey, data) => {
        this.batches.push({ primaryKey, data });
      };

      this.requestCollector = new RequestCollector(this.callback, options);
    });

    afterEach(function() {
      this.clock.restore();
    });

    it('should call callback when batch size reached 10', function() {
      for (var i = 0; i < 10; i++) {
        this.requestCollector.add(primaryKey, { foo: i });
      }

      expect(this.batches.length).to.eql(1);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(10);
      expect(this.batches[0].data[5]).to.eql({ foo: 5 });
    });

    it('should call callback twice with proper data', function() {
      for (var i = 0; i < 21; i++) {
        this.requestCollector.add(primaryKey, { foo: i });
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
        this.requestCollector.add(primaryKey, { foo: i });
        this.requestCollector.add(primaryKey2, { bar: i });
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
      this.requestCollector.add(primaryKey, { foo: 0 });
      for (var i = 1; i < 10; i++) {
        this.requestCollector.add(primaryKey, { foo: i });
        this.requestCollector.add(primaryKey2, { foo: i });
      }

      expect(this.batches.length).to.eql(1);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(10);
      expect(this.batches[0].data[5]).to.eql({ foo: 5 });
    });

    it('should call callback after batch timeout', function() {
      this.requestCollector.add(primaryKey, { foo: 0 });

      expect(this.batches.length).to.eql(0);

      this.clock.tick(options.batchTimeout);

      expect(this.batches.length).to.eql(1);
      expect(this.batches[0].primaryKey).to.eql(primaryKey);
      expect(this.batches[0].data.length).to.eql(1);
      expect(this.batches[0].data[0]).to.eql({ foo: 0 });
    });

    it('should call callback after batch timeout for multiple primaryKeys', function() {
      this.requestCollector.add(primaryKey, { foo: 0 });
      this.requestCollector.add(primaryKey2, { bar: 0 });
      this.requestCollector.add(primaryKey2, { bar: 1 });

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
        this.requestCollector.add(primaryKey, { foo: i });
      }

      this.clock.tick(options.batchTimeout * 3);

      expect(this.batches.length).to.eql(1);
    });
  });
});
