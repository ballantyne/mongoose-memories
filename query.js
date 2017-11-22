const path           = require('path');
const klass          = require('klass');
const _              = require('underscore');
const notImplemented = require(path.join(__dirname, 'not_implemented'));

module.exports = klass(function(obj, col) {
  this.query           = obj;
  this.collection      = col;
}).methods({
  operate: function(key, query, collection) {
    var self  = this;
    var value = query[key];
    var newCollection;

    switch(true) {
      case (typeof value == 'object'):
        switch(true) { 
          case (value instanceof RegExp):
            newCollection = _.reject(collection, function(i) { return value.test(i[key]) == false })
            break;
          default: 
            var keys = _.keys(value);
            newCollection = collection;
            _.each(keys, function(k) {
              var v = value[k];
	      newCollection = self[k](key, v, collection);
            })
        }
      case (key.indexOf('.') > -1):
        newCollection = _.reject(collection, function(i) { 
          var keys = key.split('.');
          _.each(keys, function(k) {
            i = i[k];
	    if (_.last(keys) == k) {
	      if (value instanceof RegExp) {
                return value.test(i) == false;
              } else {
                return i[k] != value;
              }
            }
          })
        })
        
        break;
      default:
        newCollection = _.reject(collection, function(i) { return i[key] != value })
    }
    
    return newCollection; 
  },



  eq:            function(key, value, collection) {
    return _.reject(collection, function(i) { return i[key] != value });
  },

  gt:            function(key, value, collection) {
    return _.reject(collection, function(i) { return (i[key] >= value) != false });
  },

  gte:           function(key, value, collection) {
    return _.reject(collection, function(i) { return (i[key] > value) != false })
  },

  in:            function(key, value, collection) {
    return _.reject(collection, function(i) { return (value.indexOf(i[key]) > -1) != false })
  },

  lt:            function(key, value, collection) {
    return _.reject(collection, function(i) { return (i[key] <= value) != false });
  },

  lte:           function(key, value, collection) {
    return _.reject(collection, function(i) { return (i[key] < value) != false });
  },

  ne:            function(key, value, collection) {
    return _.reject(collection, function(i) { return (i[key] == value) });
  },

  nin:           function(key, value, collection) {
    notImplemented('nin'); 
    
    return collection;
  },

  and:           function(key, value, collection) {
    notImplemented('and'); 
    
    return collection;
  },

  not:           function(key, value, collection) {
    notImplemented('not'); 
    
    return collection;
  },

  nor:           function(key, value, collection) {
    notImplemented('nor'); 
    
    return collection;
  },

  or:            function(key, value, collection) {
    notImplemented('or'); 
    
    return collection;
  },

  exists:        function(key, value, collection) {
    notImplemented('exists'); 
    
    return collection;
  },

  type:          function(key, value, collection) {
    notImplemented('type'); 
    
    return collection;
  },

  mod:           function(key, value, collection) {
    notImplemented('mod'); 
    
    return collection;
  },

  regex:         function(key, value, collection) {
    notImplemented('regex'); 
    
    return collection;
  },

  text:          function(key, value, collection) {
    notImplemented('text'); 
    
    return collection;
  },

  where:         function(key, value, collection) {
    var obj = {};
    obj[key] = value;
    return _.where(collection, obj);
  },

  geoIntersects: function(key, value, collection) {
    notImplemented('geoIntersects'); 
    
    return collection;
  },

  geoWithin:     function(key, value, collection) {
    notImplemented('geoWithin'); 
    
    return collection;
  },

  near:          function(key, value, collection) {
    notImplemented('near'); 
    
    return collection;
  },

  nearSphere:    function(key, value, collection) {
    notImplemented('nearSphere'); 
    
    return collection;
  },

  all:           function(key, value, collection) {
    notImplemented('all'); 
    
    return collection;
  },

  elemMatch:     function(key, value, collection) {
    notImplemented('elemMatch'); 
    
    return collection;
  },

  size:          function(key, value, collection) {
    notImplemented('size'); 
    
    return collection;
  },

  bitsAllClear:  function(key, value, collection) {
    notImplemented('bitsAllClear'); 
    
    return collection;
  },

  bitsAllSet:    function(key, value, collection) {
    notImplemented('bitAllSet'); 
    
    return collection;
  },

  bitsAnyClear:  function(key, value, collection) {
    notImplemented('bitsAnyClear'); 
    
    return collection;
  },

  bitsAnySet:    function(key, value, collection) {
    notImplemented('bitAnySet'); 
    
    return collection;
  },

  comment:       function(key, value, collection) {
    notImplemented('comment'); 
    
    return collection;
  },

  meta:          function(key, value, collection) {
    notImplemented('meta'); 
    
    return collection;
  },
  
  slice:         function(key, value, collection) {
    notImplemented('slice'); 
    
    return collection;
  },
  
  iterateKeys: function(obj, col, next) {
    var self = this;
    var keys = _.keys(obj);
    if (keys.length > 0) {
      _.each(keys, function(k) {
        col = self.operate(k, self.query, col);

        if (_.last(keys) == k) {
          if (next) {
            next(null, col);
          } else {
            return col;
          }
        }
      })
    } else {
      next(null, col);
    }
  },

  createInstances: function(items) {
    Instance.prototype.model = this.model;
    return _.map(items, function(i){ return new Instance(i)  });
  },

  exec: function(next) {
    var self = this;
    self.iterateKeys(self.query, self.collection, function(err, col) {
      next(null, col);
    })
  }
})


