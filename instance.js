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
        Middleware.prototype.event      = function() { return evt};
        Middleware.prototype.timing     = function() { return 'pre'};
        Middleware.prototype.middleware = hook.fn;             
        var middleware                  = new Middleware(self);

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
        Middleware.prototype.event      = function() { return evt };
        Middleware.prototype.timing     = function() { return 'post'};
        Middleware.prototype.middleware = hook.fn;             
        var middleware                  = new Middleware(self);

        middleware.post(function() {
          _.extend(self, middleware);
          if (_.last(funcs).id == hook.id) {
            next(null, self);
          }
        })
      });
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
      self.db().collection.push(self.toObject());     
      next(null, self);
    } else {
      self.removeRecord(function() {
        self.db().collection.push(self.toObject());
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

