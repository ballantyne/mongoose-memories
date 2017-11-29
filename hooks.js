const klass  = require('klass');
const _      = require('underscore');
const bson   = require('bson');
var ObjectID = bson.ObjectID;

module.exports = klass(function(schema) {
  
  this.init             = { pre: [], post: [] };
  this.save             = { pre: [], post: [] };
  this.update           = { pre: [], post: [] };
  this.remove           = { pre: [], post: [] };
  this.find             = { pre: [], post: [] };
  this.findOne          = { pre: [], post: [] };
  this.findOneAndRemove = { pre: [], post: [] };
  this.findOneAndUpdate = { pre: [], post: [] };
  this.validate         = { pre: [], post: [] };

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
