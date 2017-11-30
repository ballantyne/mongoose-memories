
const path     = require('path');
const klass  = require('klass');
const _      = require('underscore');


var Hooks = require(path.join(__dirname, 'hooks'));
var Class = require(path.join(__dirname, 'class'));

module.exports = function(model, schema, reset) {
  var methods = schema.methods;
  var statics = schema.statics;
  // delete schema.statics;
  // delete schema.methods;
  this.establish = function(model, schema) {
    global.memory_database[model]              = {};
    global.memory_database[model].name         = model;
    global.memory_database[model].collection   = [];
    global.memory_database[model].schema       = schema;
 
  }

  if (global.memory_database[model] == undefined || reset) {
    this.establish(model, schema);
  }

  var NewClass = Class.extend(function() {}).statics(statics).methods(methods);
  var c = new NewClass(model);

  return c;

}

