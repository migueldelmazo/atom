/* eslint no-console: 0 */

console.log('example: get-set');
// require atom
const atom = require('../src/index.js');
// set email in atom
console.log('set email in atom');
atom.set('user.email', 'atom@mail.com');
// get and console email
console.log('get email from atom', atom.get('user.email'));
console.log('\n');
