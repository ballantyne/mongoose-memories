const klass        = require('klass');
const path         = require('path');
const mongoose     = require(path.join(__dirname, '..', '..', 'index'));
const Schema       = mongoose.Schema;

const ProfileImage = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  username: String
});


ProfileImage.plugin(function(schema, options) {
  schema.pre('save', function(next) {
    this.plugin = JSON.parse(JSON.stringify(this));
    this.toSave = options.toSave;
    next();

  })

}, {toSave: 'saved'})


module.exports     = mongoose.model('ProfileImageWithPlugin', ProfileImage, true);
