# Object Batcher

Used primarily by `@emartech/rabbitmq-client`'s batch consumer.

# Usage

## Initialize
```javascript

const ObjectBatcher = require('@emartech/object-batcher-js');

const objectBatcher = new ObjectBatcher(callback_fn, {
  batchSize,
  batchTimeout,
  [prefetchCount]
});
```

The callback function will be called after the `batchTimeout` expires or the pushed items count reaches the set `batchSize` or the overall pushed items count reaches the given `prefecthCount`.


## Pushing an item into the object batcher

```javascript
objectBatcher.add(groupBy, payload);
```

Different payloads with the same groups will be batched and the callback will be called with `(groupBy, payloads)` arguments.

## Reseting state of batcher

```javascript
objectBatcher.resetState();
```

This method is mostly usefull during testing. Before each test case you could call `resetState` to ensure the leftover
state from previous run does not interfere with the current one.

---

Copyright EMARSYS 2020 All rights reserved.