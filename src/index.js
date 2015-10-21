'use strict';

var _ = require('lodash');

var atom = {},

  // contexts

  contexts = [],

  addContext = function (context) {
    var contextAtom = context.atom;
    if (contextAtom && contextAtom.listeners && contextAtom.onChange) {
      contextAtom.listeners = _.flattenDeep(contextAtom.listeners);
      contexts.push(context);
    }
  },

  removeContext = function (context) {
    var contextAtom = context.atom,
      idx;
    if (contextAtom && contextAtom.listeners && contextAtom.onChange) {
      idx = contexts.indexOf(context);
      if (idx >= 0) {
        contexts.splice(idx, 1);
      }
    }
  },

  // initial values

  setInitialValues = function (context) {
    _.each(_.get(context, 'atom.initialValues'), function (item) {
      _.set(atom, item.attr, _.result(item, 'value'), item.options);
    });
  },

  // on change

  changedAttrs = [],

  onChange = function (attr, options) {
    if (!attr && options && options.silent) {
      return;
    }
    changedAttrs.push(attr);
    triggerChangesDebounced();
  },

  getChangedAttrs = function () {
    var _changedAttrs = _.uniq(changedAttrs);
    changedAttrs = [];
    return _changedAttrs;
  },

  triggerChanges = function () {
    var attrs = getChangedAttrs();
    console.group('atom attrs changed', attrs);
    _.each(contexts, function (context) {
      if (haveAttrChanged(context, attrs)) {
        triggerChangesToContext(context);
      }
    });
    console.groupEnd();
  },

  triggerChangesDebounced = _.debounce(triggerChanges, 10),

  haveAttrChanged = function (context, changedAttrs) {
    return !!_.find(context.atom.listeners, function (attr) {
      return _.find(changedAttrs, function (changedAttr) {
        return attr.indexOf(changedAttr) === 0 || changedAttr.indexOf(attr) === 0;
      });
    });
  },

  triggerChangesToContext = function (context) {
    if (_.isFunction(context.atom.onChange)) {
      context.atom.onChange.call(context);
    }
  };

module.exports = {

  // listeners

  on (context) {
    addContext(context);
    setInitialValues(context);
  },

  off (context) {
    removeContext(context);
  },

  // mixin

  mixin (mixins) {
    _.each(mixins, function (value, key) {
      module.exports[key] = value.bind(module.exports);
    });
  },

  onChange (attr, options) {
    onChange(attr, options);
  },

  // get/set values

  del (attr, options) {
    _.set(atom, attr, undefined);
    onChange(attr, options);
  },

  get (attr, defaultValue) {
    return _.get(atom, attr, defaultValue);
  },

  has (attr) {
    return _.has(atom, attr);
  },

  set (attr, value, options) {
    if (!_.isEqual(_.get(atom, attr), value)) {
      _.set(atom, attr, value);
      onChange(attr, options);
    }
  },

  // get/set collections

  add (attr, value, options) {
    var arr = _.get(atom, attr);
    if (_.isArray(arr)) {
      arr.splice(0, 0, value);
      onChange(attr, options);
    }
  },

  at (attr, index, size) {
    return _.at(_.get(atom, attr), index, size);
  },

  concat (attr, value, options) {
    var arr = _.get(atom, attr);
    if (_.isArray(arr)) {
      _.set(atom, attr, arr.concat(value));
      onChange(attr, options);
    }
  },

  pop (attr, options) {
    var arr = _.get(atom, attr),
      result;
    if (_.isArray(arr)) {
      result = arr.pop();
      onChange(attr, options);
    }
    return result;
  },

  push (attr, value, options) {
    var arr = _.get(atom, attr);
    if (_.isArray(arr)) {
      arr.push(value);
      onChange(attr, options);
    }
  },

  remove (attr, where, options) {
    var arr = _.get(atom, attr),
      idx = _.findIndex(arr, where);
    if (idx >= 0) {
      arr.splice(idx, 1);
      onChange(attr, options);
    }
  },

  reset (attr, value, options) {
    if (value === undefined) {
      value = [];
    } else if (!_.isArray(value)) {
      value = [value];
    }
    _.set(attr, value);
    onChange(attr, options);
  },

  size (attr) {
    return _.size(_.get(atom, attr));
  },

  update (attr, where, value, options) {
    var arr = _.get(atom, attr),
      item = _.find(arr, where);
    if (item) {
      _.merge(item, value);
      onChange(attr, options);
    }
  }

};

window.Atom = module.exports;
window.atom = atom;
