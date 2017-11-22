const path   = require('path');
const klass  = require('klass');
const _      = require('underscore');

var QueryGroup = require(path.join(__dirname, 'query_group'));
var Instance   = require(path.join(__dirname, 'instance'));

module.exports = klass(function(model) {

  var self         = this;
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

  queryGroup:function(model, options) {
    var self = this;
    var ClassQuery = QueryGroup.extend(function() {});

    ClassQuery.prototype.class = function() {
      return self;
    }
    return new ClassQuery(model, options);
  },


  where: function(options, next) {
    var q = this.queryGroup(this.model, options);
    if (next) {
      q.exec(next);     
    } else {
      return q;
    }
  },

  find: function(options, next) {
    var q = this.queryGroup(this.model, options);
    if (next) {
      q.exec(next);
    } else {
      return q;
    }
  },
  
  findOne: function(options, next) {
    this.queryGroup(this.model, options).findOne(next); 
  },
 
  update: function(query, doc, options, next) {
    if (typeof options == 'function') next = options;
    
    var self = this;
    var newRecords = [];
    this.find(query, function(err, records) {
      _.each(records, function(record) {
	// _.extend(record, doc);
	record.update(doc, function(err, newRecord) {
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

  new_instance: function(record) {
    var self = this;
    var ClassInstance = Instance.extend(function() {}).methods({
      class: function() {
        return self;
      },   

      model: function() {
        return self.model;
      }
    })
    return new ClassInstance(record);
  },

  new: function(record) {
    var self = this;
    return this.new_instance(record);
  },


  create: function(record, next) {
    var self = this;

    record = this.new_instance(record);

    record.save(function(err, doc) {
    if(next) {
        next(err, doc);
      } else {
        return doc;
      }
    });

  }
});


