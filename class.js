const path   = require('path');
const klass  = require('klass');
const _      = require('underscore');

var QueryGroup = require(path.join(__dirname, 'query_group'));
var Instance   = require(path.join(__dirname, 'instance'));

module.exports = klass(function(model) {

  this.model       = model;

}).methods({

  db: function() {
    return global.memory_database[this.model]
  },

  hooks: function() {
    return this.db().schema.hooks;
  },

  schema: function() {
    return this.db().schema.attributes;
  },

  validators: function() {
    return this.db().schema.validators;
  },

  where: function(options, next) {
    var q = new QueryGroup(this.model, options);
    if (next) {
      q.exec(next);     
    } else {
      return q;
    }
  },

  find: function(options, next) {
    var q = new QueryGroup(this.model, options);
    if (next) {
      q.exec(next);
    } else {
      return q;
    }
  },
  
  findOne: function(options, next) {
    new QueryGroup(this.model, options).findOne(next); 
  },
 
  update: function(query, doc, next) {
    var self = this;
    var newRecords = [];
    this.find(query, function(err, records) {
      _.each(records, function(record) {
	_.extend(record, doc);
	record.update(function(err, newRecord) {
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

  remove: function(query, next) {
    var self = this;
    self.find(query).exec(function(err, records) {
      self.db().collection = _.reject(self.db().collection, function(obj) { 
        return (_.map(records, function(i) { return i._id }).indexOf(obj._id) > -1)
      })

      if (next) {
        next(null);
      }
    })
  },

  create: function(record, next) {
    var self = this;

    Instance.prototype.class = function() {
      return self;
    }   

    Instance.prototype.model = function() {
      return self.model;
    }   

    record = new Instance(record);

    record.save(function(err, doc) {
      if(next) {
        next(err, doc);
      } else {
        return doc;
      }
    });

  }
});


