var _            = require('underscore');

module.exports.attrs = function attrs(object) {
  return _.omit(object, function(value, key, object) {
    return typeof object[key] == 'function';
  });
}
