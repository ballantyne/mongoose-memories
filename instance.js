const path     = require('path');
const klass    = require('klass');
const _        = require('underscore');
const bson     = require('bson');

var ObjectID   = bson.ObjectID;
var Middleware = require(path.join(__dirname, 'middleware'));
// var Class      = require(path.join(__dirname, 'class'));


module.exports = klass(function(data) {

  _.extend(this, data);

}).methods({

  generateId: function() { 
    this._id = new ObjectID().toString();
  },

  db: function() {
    return global.memory_database[this.model()];
  },

  toObject: function() {
    return JSON.parse(JSON.stringify(this));
  },

  hooks: function(evt, timing) {
    return this.db().schema.hooks[evt][timing];
  },

  save: function(done) {
    this.callbackChain('save', 'replaceRecord', done);
  },

  callbackChain: function(evt, func, done) {
    var self = this;
    self.before(evt, function(err, doc) {
      self[func](function(err, doc) {
        self.after(evt, function(err, doc) {
          done(err, doc);
        });
      });
    })	
  },

  before: function(evt, next) {
    var self  = this;
    var funcs = self.hooks(evt, 'pre');
    if (funcs.length == 0) {
      next(null, self);
    } else {
      _.each(funcs, function(hook) {
        var Before = Middleware.extend(function() {}).methods({
          event: function() { return evt},
          timing: function() { return 'pre'},
          beforeSave: hook.fn
        })
        var middleware                  = new Before(self);
        middleware.pre(function() {
          _.extend(self, middleware);
          if (_.last(funcs).id == hook.id) {
            next(null, self);
          }
        })
      });
    }
  },

  after: function(evt, next) {
    var self  = this;
    var funcs = self.hooks(evt, 'post');
    if (funcs.length == 0) {
      next(null, self);
    } else {
      _.each(funcs, function(hook) {
        var After = Middleware.extend(function() {}).methods({
          event: function() { return evt},
          timing: function() { return 'post'},
          afterSave: hook.fn
        })
        var middleware                  = new After(self);
        middleware.post(function() {
          _.extend(self, middleware);
          if (_.last(funcs).id == hook.id) {
            next(null, self);
          }
        })
      });
    }
  },

  enforceSchema:function(obj) {
    if (this.db().schema.options.strict) {
      var self = this;
      var keys = _.keys(obj);
      console.log(this.db().schema)
      return _.omit(obj, function(value, key, object) {
        return self.db().schema.validators.attributes.indexOf(key) == -1;
      })
    } else {
      return obj;
    }
  },

  update: function(document, next) {
    var self = this;
    self.before('update', function(err, doc) {
      if (document['$set'] != undefined) {
        var toSet = _.keys(document['$set']);
        for (i = 0; i < toSet.length; i++) { 
          self[toSet[i]] = document['$set'][toSet[i]];
        }
      } else {
        _.extend(self, document);
      }
      self.replaceRecord(function(err, doc) {
        self.after('update', function(err, doc) {
          next(err, doc);
        });
      });
    })	
  },

  replaceRecord: function(next) {
    var self = this;
    if (self._id == undefined) {
      self.generateId();
      var obj = self.enforceSchema(self);
      self.db().collection.push(obj);
      next(null, self);
    } else {
      self.removeRecord(function() {
	var obj = self.enforceSchema(self);
        self.db().collection.push(obj);
        if (next) {
          next();
        }
      })
    }
  },

  removeRecord: function(next) {
    var self = this;
    this.db().collection = _.reject(this.db().collection, function(obj) { return obj._id == self._id})
    if (next) {
      next(null);
    }
  },

  remove: function(next) {
    this.callbackChain('remove', 'removeRecord', next);
  }

});

