const path   = require('path');
const klass  = require('klass');
const _      = require('underscore');
const bson   = require('bson');
var ObjectID = bson.ObjectID;

var Validators   = require(path.join(__dirname, 'validators'));
var Hooks        = require(path.join(__dirname, 'hooks'));

module.exports = klass(function(schema, options) {
  if (options == undefined) {
    options = { strict: true };
  }
  this.hooks        = new Hooks();
  this.validators   = new Validators(schema);
  this.attributes   = schema;
  this.options      = options;

}).statics({
  Types: {
    Mixed: {},
    ObjectId: function() {
      var id  = new ObjectID();
      return id.toString(); 
    } 
  }
}).methods({

  plugin: function(func, options) {
    func(this, options);
  },

  add: function(item) {
    _.extend(this.schema, item);
  },

  pre: function(evt, func) {
    var obj = {id: new ObjectID().toString(), fn: func};
    this.hooks[evt].pre.push(obj);
  },

  post: function(evt, func) {
    var obj = {id: new ObjectID().toString(), fn: func};
    this.hooks[evt].post.push(obj);
  }

})

