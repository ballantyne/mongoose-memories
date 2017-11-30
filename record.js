
const path     = require('path');
const klass    = require('klass');
const _        = require('underscore');
const bson     = require('bson');

const object   = require(path.join(__dirname, 'object'));

var ObjectID   = bson.ObjectID;
var Middleware = require(path.join(__dirname, 'middleware'));

module.exports = klass(function(data) {
  _.extend(this, this.toObject(data));

}).methods({


  generateId: function() { 
    this._id = new ObjectID().toString();
  },

  db: function() {
    return global.memory_database[this.model()];
  },

  toObject: function(doc) {
    return JSON.parse(JSON.stringify(doc));
  },

  hooks: function(evt, timing) {
    // console.log(this.db().schema);
    return this.db().schema.hooks[evt][timing];
  },

  saveCallbacks: function(done) {
    this.callbackChain('save', done);
  },

  callbackChain: function(evt, done) {
    var self = this;
    self.before(evt, function(err, doc) {
      self[evt](function(err, doc) {
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
          beforeFunction: hook.fn
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
          afterFunction: hook.fn
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
      
      var schemaAttrs =  self.db().schema.validators.attributes;

      return _.omit(obj, function(value, key, object) {
        return schemaAttrs.indexOf(key) == -1;
      })
    } else {
      return obj;
    }
  },

  update: function(document, next) {
    if (document['$set'] != undefined) {
      var toSet = _.keys(document['$set']);
      for (i = 0; i < toSet.length; i++) { 
        self[toSet[i]] = document['$set'][toSet[i]];
      }
    } else {
      _.extend(self, document);
    }
    next(null, self);
  },

  updateCallbacks: function(document, next) {
    var self = this;
    self.before('update', function(err, doc) {
     self.update(document, function(err, doc) {
        self.after('update', function(err, doc) {
          next(err, doc);
        });
      });
    })	
  },

  addToCollection(next) {
    var self = this;
    var obj = object.attrs(self.enforceSchema(self));
    self.db().collection.push(obj);
    next();
  },

  save: function(next) {
    var self = this;
    if (self._id == undefined) {
      self.generateId();
      self.addToCollection(function() {
        next(null, self);
      });
    } else {
      self.remove(function() {
        self.addToCollection(function() {
          next(null, self);
        });
      })
    }
  },

  remove: function(next) {
    var self = this;
    this.db().collection = _.reject(this.db().collection, function(obj) { return obj._id == self._id})
    if (next) {
      next(null);
    }
  },

  removeCallbacks: function(next) {
    this.callbackChain('remove', next);
  }

});
