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
    var obj = {id: new ObjectID().toString(), fn: func};
    this[evt].pre.push(obj);
  },

  post: function(evt, func) {
    var obj = {id: new ObjectID().toString(), fn: func};
    this[evt].post.push(obj);
  }

})
