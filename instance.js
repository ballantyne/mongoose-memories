const path     = require('path');
const klass    = require('klass');
const _        = require('underscore');
const bson     = require('bson');

const object   = require(path.join(__dirname, 'object'));

var ObjectID   = bson.ObjectID;
var Middleware = require(path.join(__dirname, 'middleware'));
var Record     = require(path.join(__dirname, 'record'));


module.exports = klass(function(data) {
  _.extend(this, data);
}).methods({

  db: function() {
    return global.memory_database[this.model()];
  },

  document: function() {
    var self = this;
    var record = new Record(this);
    record.implement({
      model: self.model,
      class: self.class,
      file: self.file,
      uploads: self.uploads
    })

    record.implement(this.db().schema.methods);

    return record
  },

  save: function(done) {
    var self = this;
    this.document().saveCallbacks(function(err, doc) {
      _.extend(self, doc);
      done(err, self)
    });
  },

  update: function(document, done) {
    var self = this;
    this.document().updateCallbacks(document, function(err, doc) {
      _.extend(self, doc);
      done(err, self);
    });
  },

  remove: function(done) {
    var self = this;
    this.document().removeCallbacks(function(err, doc) {
      _.extend(self, doc);
      done(err, self)
    });
  }

});

