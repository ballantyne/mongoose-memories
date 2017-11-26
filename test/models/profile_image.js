const klass        = require('klass');
const path         = require('path');
const mongoose     = require(path.join(__dirname, '..', '..', 'index'));
const Schema       = mongoose.Schema;

const ProfileImage = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  username: String
}, {strict: false});

module.exports     = mongoose.model('ProfileImage', ProfileImage, true);
