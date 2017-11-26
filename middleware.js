const klass    = require('klass');
const _        = require('underscore');

module.exports = klass(function(record) {

  _.extend(this, record);

}).methods({
  pre: function(next) {
    this.beforeSave(next);
  },

  post: function(next) {
    if (this.event() == 'update' && this.timing() == 'post') {
      this.afterSave(null, this, next);
    } else {
      this.afterSave(this, next);
    }
  }

});

