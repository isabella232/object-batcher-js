# Object Batcher

Used primarily by `@emartech/rabbitmq-client`'s batch consumer.

# Usage

## Initialize
```javascript

const ObjectBatcher = require('@emartech/object-batcher-js');

const objectBatcher = new ObjectBatcher(callback_fn, {
  batchSize,
  batchTimeout
});
```

The callback function will be called after the batchTimeout expires or the pushed items count reaches the set batchSize.

## Pushing an item into the object batcher

```javascript
objectBatcher.add(groupBy, payload);
```

Different payloads with the same groups will be batched and the callback will be called with `(groupBy, payloads)` arguments.

---

Copyright EMARSYS 2018 All rights reserved.