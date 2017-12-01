var os           = require('os');
var path         = require('path');
var expect       = require("chai").expect;
var _            = require('underscore');
var o            = require(path.join(__dirname, '..', 'object'));
var fs           = require('fs');
var request      = require('request');
const klass        = require('klass');
const mongoose     = require(path.join(__dirname, '..', 'index'));
const Schema       = mongoose.Schema;



describe("Mongoose Memories", function() {
  describe('Middleware', function() {
    it("update", function(done) {
      
      const ProfileImageSchema = new Schema({
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        username: String
      }, {strict: false});

      var now = new Date();

      // ProfileImageSchema.pre('update', function() {
      //   this.update({}, {$set: {updatedAt: now }});
      // })
    
      var ProfileImage     = mongoose.model('ProfileImage', ProfileImageSchema, true);       
          
      ProfileImage.create({}, function(err, doc) {
        ProfileImage.update({_id: doc._id}, {username: 'scott'}, function(err, doc) {
          console.log(doc);
          // expect(doc.updatedAt).to.equal(now);
          done();
        });
      });

    });
  });
})
