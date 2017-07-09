# Atom

## Reactive Data Model (es6)

Model set and get the data. The changes are propagated using the observe/observable pattern.
Changes are propagated in the next thread.

## Usage

Use `on(context, definitions)` method to observe changes in model
Use setters and getters to manipulate the model

## Methods

```javascript
atom.on (context, definitions) // observe changes in model
```

- `context` where run observable method
- `definition` semantic object
  -  `{ paths: ['pathProperty', 'other.pathProperty'], run: ['observableMethod', 'otherObservableMethod'] }` // paths uses dot notation

```javascript
atom.off (context) // stop observing changes in the model
```
