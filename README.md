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

Uses dot notation to access model elements

## Methods

### Observer/observable

```javascript
atom.on (context, definitions) // subscribes a method and a model path
```
