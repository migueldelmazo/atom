# Atom

## Reactive Data Model (es6)

Model set and get the data. The changes are propagated using the observe/observable pattern.
Changes are propagated in the next thread.

Atom is a model (internally a JSON) where you can set and get data with the following functions:

```javascript
atom.set('user.email', 'atom@mail.com')
atom.get('user.email') // atom@mail.com
```

And you can observe changes in the model with the function:

```javascript
var myInstance = new MyClass()

atom.on(myInstance, {
  paths: 'user.email',
  run: 'onUserEmailChange'
})

atom.set('user.email', 'atom@mail.com')

// method myInstance.onUserEmailChange will be executed in the next thread
```

## What is it useful for?

Atom helps you to apply the observer/observable pattern in a Javascript application.

The propagation of the changes is done in the next Javascript thread, therefore, it minimizes the number of times the data is propagated and saves memory in the call stack.

Uses dot notation to access model elements.

## Methods

### Observer/observable

```javascript
atom.on(context, definitions) // subscribes a method and a model path
atom.off(context) // unsubscribes a method from the model

```

- context: context where run observable method
  - [object|class instance|undefined]
- definitions: an object with properties
  - paths: path to observe
    - [string|array of strings]
  - run: method to run when path's value changes
    - [string|function|array of strings and functions]
    - if method is a string atom find this a method with this name in the context

### getters

```javascript
at(path, idx, defaultValue)

filter(path, predicate)

find(path, predicate, defaultValue)

get(path)

has(path)

isEmpty(path)

pluck(path, property)

size(path)
```

### setters

```javascript
concat(path, value = [])

pop(path, defaultValue)

push(path, value)

remove(path, predicate)

reset(path, value = [])

set(path, value)

toggle(path, status)

unset(path)

update(path, value, predicate)
```

### helpers

```javascript

path(...paths) // returns a path in string with dot notation

mixin(mixins) // add mixins to atom

log() // returns a copy of model
```
