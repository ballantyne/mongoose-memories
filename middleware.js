const klass    = require('klass');
const _        = require('underscore');

module.exports = klass(function(record) {

  _.extend(this, record);

}).methods({
  pre: function(next) {
    this.beforeFunction(next);
  },

  post: function(next) {
    if (this.event() == 'update' && this.timing() == 'post') {
      this.afterFunction(null, this, next);
    } else {
      this.afterFunction(this, next);
    }
  }

});

