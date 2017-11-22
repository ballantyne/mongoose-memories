const path   = require('path');
const klass  = require('klass');
const _      = require('underscore');

var Query    = require(path.join(__dirname, 'query'));
var Instance = require(path.join(__dirname, 'instance'));

module.exports = klass(function(model, obj) {
  this.model      = model;
  
  if (obj.limit) {
    this.limit    = obj.limit
    delete obj.limit;
  }
  
  this.stack      = [obj];

}).methods({

  where: function(obj) {
    this.stack.push(obj)
    return this;
  },  

  limit: function(l) {
    this.limit = l;
    return this;
  },

  select: function(select) {
    this.select = select;
    return this;
  },
  
  collection: function() {
    return global.memory_database[this.model].collection
  },

  createInstances: function(items, next) {
    Instance.prototype.model = this.model;
    items = _.map(items, function(i){ return new Instance(i)  });
    next(null, items);
  },

  findOne: function(next) {
    this.exec(function(err, doc) {
      next(err, doc[0])
    }); 
  },

  exec: function(next) {
    var self  = this;
    var items = this.collection();
    var index = 0;
    _.each(this.stack, function(options) {
      var query = new Query(options, items);
      query.exec(function(err, response) {
        if (err) {
          next(err);
        } else {
	  items = response;
          index += 1;
	  if (self.stack.length == index) {
	    self.createInstances(items, function(err, items) {
              next(null, items);
            })
	  }
        }
      })
    })
  }
})

