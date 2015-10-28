'use strict';

var _ = require('lodash');

var atom = {},

  // contexts

  contexts = [],

  addContext = function (context) {
    var contextAtom = context.atomConf;
    if (contextAtom && contextAtom.listeners) {
      contexts.push(context);
    }
  },

  removeContext = function (context) {
    var contextAtom = context.atomConf,
      idx;
    if (contextAtom && contextAtom.listeners) {
      idx = contexts.indexOf(context);
      if (idx >= 0) {
        contexts.splice(idx, 1);
      }
    }
  },

  // initial values

  setInitialValues = function (context) {
    _.each(_.get(context, 'atomConf.initialValues'), function (item) {
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
    triggerChangesToContext(getFilteredListeners(attrs));
    console.groupEnd();
  },

  getFilteredListeners = function (attrs) {
    var listeners = [];
    _.each(contexts, function (context) {
      _.each(context.atomConf.listeners, function (listener) {
        if (haveAttrChanged(listener.attrs, attrs)) {
          listeners.push({
            context,
            onChange: listener.onChange
          });
        }
      });
    });
    return listeners;
  },

  haveAttrChanged = function (contextAttrs, changedAttrs) {
    return !!_.find(contextAttrs, function (contextAttr) {
      return _.find(changedAttrs, function (changedAttr) {
        return contextAttr.indexOf(changedAttr) === 0 || changedAttr.indexOf(contextAttr) === 0;
      });
    });
  },

  triggerChangesToContext = function (filteredListeners) {
    var listener;
    while (filteredListeners.length) {
      listener = filteredListeners.splice(0, 1);
      _.result(listener[0].context, listener[0].onChange);
    }
  },

  triggerChangesDebounced = _.debounce(triggerChanges, 10);

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
