
const path     = require('path');
const klass  = require('klass');
const _      = require('underscore');


var Hooks = require(path.join(__dirname, 'hooks'));
var Class = require(path.join(__dirname, 'class'));

module.exports = function(model, schema, reset) {

  this.establish = function(model, schema) {
    global.memory_database[model]              = {};
    global.memory_database[model].name         = model;
    global.memory_database[model].collection   = [];
    global.memory_database[model].schema       = schema;
 
  }

  if (global.memory_database[model] == undefined || reset) {
    this.establish(model, schema);
  }

  return new Class(model);

}

