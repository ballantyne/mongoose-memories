const klass  = require('klass');
const _      = require('underscore');
const bson   = require('bson');
var ObjectID = bson.ObjectID;

module.exports = klass(function(schema) {
  var timing        = { pre: [], post: [] };
  this.save   = _.clone(timing);
  this.update = _.clone(timing);
  this.remove = _.clone(timing);

}).methods({

  pre: function(evt, func) {
    var id = new ObjectID().toString();

    func.prototype.id = function() {
      return id;
    }
    this[evt].pre.push(func)
  },

  post: function(evt, func) {
    var id = new ObjectID().toString();

    func.prototype.id = function() {
      return id;
    }
    this[evt].post.push(func)
  }

})
