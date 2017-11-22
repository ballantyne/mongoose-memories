const path     = require('path');
const klass  = require('klass');
const _      = require('underscore');

var Attribute = klass(function(attr) {
  if (typeof attr == 'function') {
    attr = {type: attr.name, func: attr};
  } else {
    attr = {type: attr.type.name, func: attr.type};
  }
  _.extend(this, attr);
})

module.exports = klass(function(s) {
  this.attributes = _.keys(s);
  this.types = {};

  for (i = 0; i < this.attributes.length; i++) { 
    var key = this.attributes[i];
    this.types[key] = new Attribute(s[key]);
  }

})
