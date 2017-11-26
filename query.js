const path           = require('path');
const klass          = require('klass');
const _              = require('underscore');
const notImplemented = require(path.join(__dirname, 'not_implemented'));
var flatten          = require('flat')

module.exports = klass(function(op, query, col) {
  this.op              = op
  this.query           = query;
  this.collection      = col;
}).methods({


  filter: function(key, value, collection, operator) {
    var self = this;
    newCollection = _.reject(collection, function(i) { 
       i = flatten(i); 
       var shouldReject = (self.handleValue(i[key], value, operator) == false);
       return shouldReject;
    })  
    return newCollection;
  },


  handleValue: function(item, value, operator) {
    var self = this;
    if (value instanceof RegExp) {
      var matches = value.test(item);
      return self.handleOperator(matches, true, operator)
    } else {
      return self.handleOperator(item, value, operator);
    }
  },

  handleOperator: function(item, value, operator) {
    switch(operator) {
      case 'gt':
        return item > value;
        break;
      case 'lt':
        return item < value;
        break;
      case 'gte':
        return item >= value;
        break;
      case 'lte':
        return item <= value;
        break;
      case 'in':
        return value.indexOf(item) > -1;
        break;
       case 'nin':
        return  value.indexOf(item) == -1;
        break;
      case 'eq':
        return item == value;
        break; 
      case 'ne':
        return item != value;
        break;
    } 
  },

  eq:            function(key, value, collection) {
    return this.filter(key, value, collection, 'eq');
  },

  gt:            function(key, value, collection) {
    return  this.filter(key, value, collection, 'gt');
  },

  gte:           function(key, value, collection) {
    return  this.filter(key, value, collection, 'gte');
  },

  in:            function(key, value, collection) {
    return  this.filter(key, value, collection, 'in');
  },

  lt:            function(key, value, collection) {
    return  this.filter(key, value, collection, 'lt');
  },

  lte:           function(key, value, collection) {
    return  this.filter(key, value, collection, 'lte');
  },

  ne:            function(key, value, collection) {
    return  this.filter(key, value, collection, 'ne');
  },

  nin:           function(key, value, collection) {
    return  this.filter(key, value, collection, 'nin');
   
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

  where:            function(key, value, collection) {
    return this.filter(key, value, collection, 'eq');
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
  
  iterateKeys: function(c, next) {
    var self = this;
    // var c = col; 
    var keys = _.keys(self.query);
    if (keys.length > 0) {
      _.each(keys, function(k) {
        var v = self.query[k];
        c = self[self.op](k, v, c);
        if (_.last(keys) == k) {
          if (next) {
            next(null, c);
          } else {
            return c;
          }
        }
      })
    } else {
      next(null, c);
    }
  },

  exec: function(next) {
    var self = this;
    self.iterateKeys(self.collection, function(err, col) {
      next(null, col);
    })
  }
})


