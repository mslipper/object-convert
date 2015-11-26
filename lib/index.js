'use strict';

var _ = require('lodash'),
  keyMirror = require('keymirror'),
  ERRORS = keyMirror({ KEY_UNDEFINED: null, VALUE_INVALID: null }),
  warn = console.warn.bind(console, '[object-convert]');

var VALIDATORS = {
  'String': function(input) {
    return typeof input === 'string';
  },

  'Boolean': function(input) {
    return typeof input === 'boolean';
  },

  'Number': function(input) {
    return typeof input === 'number'
  },

  'Date': function(input) {
    return input instanceof Date;
  },

  'Object': function(input) {
    return typeof input === 'object';
  }
};

function objectConvert() {
  var schema;

  return {
    define: define
  };

  function define(def) {
    var ret = { convert: convert };

    if (!def) {
      return ret;
    }

    schema = def;

    return ret;
  }

  function convert(input) {
    if (!schema) {
      return input;
    }

    return traverse({ currDepth: 0 }, input, schema);
  }
}

objectConvert.MAX_DEPTH = 100;
objectConvert.ERRORS = ERRORS;
objectConvert.type = type;

function type(proto, path, opts) {
  if (!isValidPrototype(proto)) {
    throw new Error('Invalid prototype ' + proto.name + ' specified. Valid prototypes are: ' +
      Object.keys(VALIDATORS).join(', '));
  }

  opts = _.defaults(opts || {}, {
    onInvalid: onInvalid,
    onUndefined: onUndefined,
    transform: transform,
    defaultValue: null
  });

  var splitPath = path.split('.');

  return function resolve(input) {
    var val = getFromObj(splitPath, input);

    if (val === ERRORS.KEY_UNDEFINED) {
      return opts.onUndefined(path, opts.defaultValue, val)
    }

    if (!isValidValue(proto, val)) {
      return opts.onInvalid(path, opts.defaultValue, val);
    }

    return opts.transform(path, val);
  }
}

function onInvalid(path, def, val) {
  warn('Got invalid value for path ' + path + ':', val);

  return typeof def !== 'undefined' ? def : val;
}

function onUndefined() {
  return null;
}

function transform(path, val) {
  return val;
}

function getFromObj(path, obj) {
  var ptr = obj,
    len = path.length,
    last = len - 1;

  for (var i = 0; i < len; i++) {
    ptr = ptr[path[i]];

    if (i === last) {
      return typeof ptr === 'undefined' ? ERRORS.KEY_UNDEFINED : ptr;
    }

    if (typeof ptr !== 'object') {
      return ERRORS.KEY_UNDEFINED;
    }
  }
}

function traverse(state, input, schema) {
  state.currDepth++;

  if (state.currDepth === objectConvert.MAX_DEPTH) {
    throw new Error('Could not convert object: MAX_DEPTH value of ' + objectConvert.MAX_DEPTH + ' exceeded.');
  }

  var keys = Array.isArray(schema) ? schema : Object.keys(schema),
    len = keys.length,
    out = {};

  for (var i = 0; i < len; i++) {
    var key = Array.isArray(schema) ? i : keys[i],
      val = schema[key];

    if (typeof val === 'object' || Array.isArray(val)) {
      out[key] = traverse(state, input, val);

      continue;
    }

    out[key] = val(input);
  }

  return out;
}

function isValidPrototype(proto) {
  return !!VALIDATORS[proto.name];
}

function isValidValue(proto, val) {
  return VALIDATORS[proto.name].call(null, val);
}

module.exports = objectConvert;
