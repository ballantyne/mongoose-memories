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

  ne: function(query) {
    this.stack.push(query)
    return this;
  },  

  where: function(query) {
    this.stack.push(query);
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
    return (global.memory_database[this.model] ? global.memory_database[this.model].collection : [])
  },

  createInstances: function(items, next) {
    var self = this;
    items = _.map(items, function(i){ return self.class().new(i)  });
    next(null, items);
  },

  findOne: function(next) {
    var doc;
    this.exec(function(err, docs) {
      // console.log(docs)
      if (docs[0] != undefined) {
        doc = docs[0];
      } else {
        doc = null;
      }
      next(err, doc);
    }); 
  },

  update: function(doc, next) {
    var self = this;

    this.documentUpdate = doc;
    if (next) {
      this.executeUpdate(next);
    } else {
      return this;
    }
  },
  
  executeUpdate: function(next) {
    var self = this;
    var newRecords = [];
    this.executeQuery(function(err, records) {
      _.each(records, function(record) {
        record.update(self.documentUpdate, function(err, newRecord) {
          newRecords.push(newRecord);
          if (_.last(records).id == record.id) {
            if (next) {
              next(null, newRecords);
            } else {
              return self;
            }
          }
        })
      })
    })
  },

  executeQuery: function(next) {
    var self  = this;
    var items = this.collection();
    var index = 0;
    // console.log('stack', this.stack);
    _.each(this.stack, function(options) {
      var query = new Query(options.op, options.query, items);
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
  },


  exec: function(next) {
    if (this.documentUpdate != undefined) {
      this.executeUpdate(next);
    } else {
      this.executeQuery(next);
    }
  }
})

