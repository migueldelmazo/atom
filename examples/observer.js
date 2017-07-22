/* eslint no-console: 0 */

console.log('example: observer');

// require atom
const atom = require('../src/index.js'),

  // create a context
  myContext = {
    onUserEmailChange: function () {
      // executed after atom path set, get and console email
      console.log('atom.user.email has change:', atom.get('user.email'));
      console.log('\n');
    }
  };

// observe atom path
console.log('observe atom email path');
atom.on(myContext, {
  paths: 'user.email',
  run: 'onUserEmailChange'
});

// set atom path
console.log('set email in atom');
atom.set('user.email', 'atom@mail.com');
