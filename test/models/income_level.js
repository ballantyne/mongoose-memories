const klass        = require('klass');
const path         = require('path');
const mongoose     = require(path.join(__dirname, '..', '..', 'index'));
const Schema       = mongoose.Schema;

const IncomeLevel = new Schema({}, {strict: false});

module.exports     = mongoose.model('IncomeLevel', IncomeLevel, true);
