const path        = require('path');
const packageJSON = require(path.join(__dirname, 'package'));

module.exports = function(func) {
  console.log('');
  console.log(func);
  console.log('-----------------------')
  console.log('Is not implemented, please clone', packageJSON.repository.url,'and add that functionality.');
  console.log('Not filtering the collection passed to this function');
}
