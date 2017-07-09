const _ = require('lodash'),

  atom = {},

  // contexts

  contexts = [],

  getContextIdx = (context) => {
    let contextIdx = contexts.indexOf(context);
    if (contextIdx < 0) {
      context._observers = [];
      contexts.push(context);
      contextIdx = contexts.length - 1;
    }
    return contextIdx;
  },

  parseDefinitionPaths = (definition) => {
    definition.paths = _.isArray(definition.paths) ? _.flattenDeep(definition.paths) : [definition.paths];
  },

  parseDefinitionCallbacks = (definition) => {
    definition.run = _.parseArray(definition.run);
  },

  isValidDefinition = (definition) => {
    return isValidDefinitionPaths(definition.paths) && isValidDefinitionCallbacks(definition.run);
  },

  isValidDefinitionPaths = (paths) => {
    return _.every(paths, _.isString);
  },

  isValidDefinitionCallbacks = (run) => {
    return _.every(run, (runCallback) => _.isString(run) || _.isArray(run) || _.isFunction(run));
  },

  // paths

  triggerChangesDebounced = (path) => {
    changedPaths.push(path);
    clearTimeout(onChangeTimer);
    onChangeTimer = setTimeout(triggerChanges, 0);
  },

  triggerChanges = () => {
    const atomPaths = _.uniq(changedPaths);
    changedPaths = [];
    console.group('atom.triggerChanges', { atom }, { atomPaths });
    triggerChangesInContexts(atomPaths);
    console.groupEnd('atom.triggerChanges');
  },

  triggerChangesInContexts = (atomPaths) => {
    for (let contextIdx = 0; contextIdx < contexts.length; contextIdx += 1) {
      const contextsLength = contexts.length;
      triggerChangesInContext(contexts[contextIdx], atomPaths);
      contextIdx += Math.min(contexts.length - contextsLength, 0);
      contextIdx = Math.max(0, contextIdx);
    }
  },

  triggerChangesInContext = (context, atomPaths) => {
    _.each(context._observers, triggerChangesDefinition.bind(null, context, atomPaths));
  },

  triggerChangesDefinition = (context, atomPaths, definition) => {
    if (triggerChangesPathsMatch(atomPaths, definition.paths)) {
      triggerChangesCallback(context, definition);
    }
  },

  triggerChangesPathsMatch = (atomPaths, definitionPaths) => {
    return _.some(atomPaths, (atomPath) => {
      return _.some(definitionPaths, (definitionPath) => {
        return triggerChangesPathMatch(atomPath, definitionPath);
      });
    });
  },

  triggerChangesPathMatch = (atomPath, definitionPath) => {
    return atomPath === definitionPath ||
      atomPath.indexOf(definitionPath + '.') === 0 ||
      definitionPath.indexOf(atomPath + '.') === 0 ||
      atomPath.indexOf(definitionPath + '[') === 0 ||
      definitionPath.indexOf(atomPath + '[') === 0;
  },

  triggerChangesCallback = (context, definition) => {
    _.each(definition.run, (callback) => {
      _.run(context, callback, definition.options);
    });
  },

  // getters / setters

  get = (path, defaultValue) => {
    return _.get(atom, path, defaultValue);
  },

  getClone = (path, defaultValue) => {
    return _.cloneDeep(get(path, defaultValue));
  },

  set = (path, value) => {
    if (_.isString(path) && !_.isEqual(get(path), value)) {
      _.set(atom, path, value);
      triggerChangesDebounced(path);
      console.log('atom.set', { atom }, { path, value, atom });
    }
  };

let changedPaths = [],
  onChangeTimer;

module.exports = {

  // observables

  on (context, definitions) {
    const contextIdx = getContextIdx(context);
    _.each(_.parseArray(definitions), (definition) => {
      parseDefinitionPaths(definition);
      parseDefinitionCallbacks(definition);
      if (isValidDefinition(definition)) {
        contexts[contextIdx]._observers.push(definition);
      } else {
        console.warning('atom.on > invalid definitions', definitions);
      }
    });
  },

  off (context) {
    const idx = contexts.indexOf(context);
    if (idx >= 0) {
      contexts[idx]._observers = [];
      contexts.splice(idx, 1);
    }
  },

  // paths

  path (...paths) {
    return _.compact(paths).join('.').replace(/\.\[/g, '[');
  },

  // mixins

  mixin (mixins) {
    _.each(mixins, function (value, key) {
      this[key] = value.bind(this);
    }.bind(this));
  },

  // log

  log () {
    return _.cloneDeep(atom);
  },

  // getters

  at (path, idx, defaultValue) {
    return _.get(getClone(path + '[' + idx + ']'), defaultValue);
  },

  filter (path, predicate) {
    return _.filter(getClone(path, []), predicate);
  },

  find (path, predicate, defaultValue) {
    return _.find(getClone(path, []), predicate) || defaultValue;
  },

  get: getClone,

  has (path) {
    return _.has(atom, path);
  },

  isEmpty (path) {
    return _.isEmpty(get(path));
  },

  pluck (path, property) {
    return _.map(getClone(path, []), property);
  },

  size (path) {
    return _.size(get(path));
  },

  // setters

  concat (path, value = []) {
    set(path, getClone(path, []).concat(_.parseArray(value)));
  },

  pop (path, defaultValue) {
    const collection = getClone(path);
    set(path, _.initial(collection));
    return _.last(collection) || defaultValue;
  },

  push (path, value) {
    const clonedValue = getClone(path, []);
    clonedValue.push(value);
    set(path, clonedValue);
  },

  remove (path, predicate) {
    let collection = getClone(path);
    const result = _.remove(collection, predicate);
    set(path, collection);
    return result;
  },

  reset (path, value = []) {
    set(path, _.parseArray(value));
  },

  set,

  toggle (path, status) {
    set(path, status === undefined ? !get(path) : status);
  },

  unset (path) {
    set(path, undefined);
  },

  update (path, value, predicate) {
    const collection = getClone(path),
      idx = _.findIndex(collection, predicate);
    if (idx >= 0) {
      set(path + '[' + idx + ']', value);
    } else if (_.isArray(collection)) {
      this.push(path, value);
    }
  }

};
