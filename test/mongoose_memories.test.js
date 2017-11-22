var path         = require('path');
var expect       = require("chai").expect;

var ProfileImage = require(path.join(__dirname, 'models', 'profile_image'));

describe("Mongoose Memories", function() {
  describe("Model", function() {
    it("test model", function(done) {
      // console.log(ProfileImage.schema());
      var response = {test: 'test'};
      ProfileImage.create(response, function(err, doc) {
        expect(doc.test).to.equal('test');
        ProfileImage.where({_id: doc._id}).findOne(function(err, doc) {
          expect(doc.test).to.equal('test');
          done();
        });
      });
    });
  });
})
