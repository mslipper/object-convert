'use strict';

var test = require('tape'),
  converter = require('../lib');

test('type definitions', function(t) {
  var types = [ String, Boolean, Object, Date ];

  types.forEach(function(type) {
    t.ok(converter.type(type, 'someprop'), 'should allow ' + type.name + ' types');
  });

  t.throws(function() {
    converter.type('whatever', 'someprop');
  }, 'should not allow other types');

  t.equals(converter.type(String, 'test').call(null, { test: 'hello' }), 'hello',
    'should return converted values from the input');

  var opts = {
    transform: function(path, val) {
      return path + val;
    }
  };

  t.equals(converter.type(String, 'test', opts)
    .call(null, { test: 'hello' }), 'testhello',
    'should transform values when a transform is defined');

  opts = {
    onUndefined: function(path) {
      return path + ' was undefined'
    }
  };

  t.equals(converter.type(String, 'test', opts)
    .call(null, { whatever: 'hello' }), 'test was undefined',
    'should use the return value from onUndefined when input keys are undefined');

  opts = {
    onInvalid: function(path, def, val) {
      return path + ' had invalid value ' + val + ' and could use default ' + def;
    },
    defaultValue: 'whatever'
  };

  t.equals(converter.type(String, 'test', opts)
    .call(null, { test: 123 }), 'test had invalid value 123 and could use default whatever',
    'should use the return value from onInvalid when input values are invalid');

  t.equals(converter.type(String, 'test.nested.value').call(null, {
    test: {
      nested: {
        value: 'hello'
      }
    }
  }), 'hello', 'should support nested values');

  t.equals(converter.type(String, 'test.nested.1.value').call(null, {
    test: {
      nested: [ null, {
        value: 'hello'
      }]
    }
  }), 'hello', 'should support specific array indices');

  t.end();
});

test('conversions', function(t) {
  t.deepEqual(converter().define().convert({ test: true }),
    { test: true }, 'should pass-through conversions with blank definitions');

  t.end();

  var originalDepth = converter.MAX_DEPTH;

  converter.MAX_DEPTH = 3;

  t.throws(function() {
    converter().define({
      test: {
        test: {
          test: {
            test: converter.type(Boolean, 'test.test.test.test')
          }
        }
      }
    }).convert({
      test: {
        test: {
          test: {
            test: true
          }
        }
      }
    });
  }, null, 'should throw if max depth is exceeded');

  converter.MAX_DEPTH = originalDepth;

  t.deepEquals(converter().define({
    test: {
      stringProp: converter.type(String, '0.input.stringProp'),
      booleanProp: converter.type(Boolean, '0.input.booleanProp'),
      numberProp: converter.type(Number, '0.input.numberProp'),
      objectProp: converter.type(Object, '0.input.objectProp'),
      nested: {
        stringProp: converter.type(String, '0.input.nest.stringProp'),
        booleanProp: converter.type(Boolean, '0.input.nest.booleanProp'),
        numberProp: converter.type(Number, '0.input.nest.numberProp'),
        objectProp: converter.type(Object, '0.input.nest.objectProp')
      },
      flatArray: [ converter.type(String, '0.input.nest.stringProp') ],
      nestedArray: [{
        stringProp: converter.type(String, '0.input.nest.stringProp'),
        booleanProp: converter.type(Boolean, '0.input.nest.booleanProp'),
        numberProp: converter.type(Number, '0.input.nest.numberProp'),
        objectProp: converter.type(Object, '0.input.nest.objectProp', {
          transform: function(path, val) {
            return val.prop;
          }
        })
      }]
    }
  }).convert([{
    input: {
      stringProp: 'test',
      booleanProp: true,
      numberProp: 123,
      objectProp: {
        prop: 'hello'
      },
      nest: {
        stringProp: 'test',
        booleanProp: true,
        numberProp: 123,
        objectProp: {
          prop: 'hello'
        }
      }
    }
  }]), {
    test: {
      stringProp: 'test',
      booleanProp: true,
      numberProp: 123,
      objectProp: {
        prop: 'hello'
      },
      nested: {
        stringProp: 'test',
        booleanProp: true,
        numberProp: 123,
        objectProp: {
          prop: 'hello'
        }
      },
      flatArray: [ 'test' ],
      nestedArray: [{
        stringProp: 'test',
        booleanProp: true,
        numberProp: 123,
        objectProp: 'hello'
      }]
    }
  }, 'should properly convert deep nested structures');
});
