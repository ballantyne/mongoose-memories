const path   = require('path');
const klass  = require('klass');
const _      = require('underscore');
const bson   = require('bson');
var ObjectID = bson.ObjectID;

var Validators   = require(path.join(__dirname, 'validators'));
var Hooks        = require(path.join(__dirname, 'hooks'));

module.exports = klass(function(schema, options) {
  console.log(schema);
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
    console.log('adding schema item', item);
    
    _.extend(this.attributes, item);
    this.validators = new Validators(this.attributes);
  },

  pre: function(evt, func) {
    this.hooks.pre(evt, func);
  },

  post: function(evt, func) {
    this.hooks.post(evt, func);
  }

})

