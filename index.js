global.memory_database = {};

const path                 = require('path');

module.exports.Query       = require(path.join(__dirname, 'query'));
module.exports.QueryGroup  = require(path.join(__dirname, 'query_group'));
module.exports.Class       = require(path.join(__dirname, 'class'));
module.exports.Middleware  = require(path.join(__dirname, 'middleware'));
module.exports.Instance    = require(path.join(__dirname, 'instance'));
module.exports.Schema      = require(path.join(__dirname, 'schema'));
module.exports.model       = require(path.join(__dirname, 'model'));
module.exports.object      = require(path.join(__dirname, 'object'));

