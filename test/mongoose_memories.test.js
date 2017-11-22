var os           = require('os');
var path         = require('path');
var expect       = require("chai").expect;
var _            = require('underscore');
var o            = require(path.join(__dirname, '..', 'object'));
var fs           = require('fs');
var request      = require('request');

var download = function(url, location, next) {
  if (fs.exists(location)) {
    next(null, location);
  } else {
    var stream = fs.createWriteStream(location);
    stream.on('close', function() {
      next(null, location);
    })
    request(url).pipe(stream)
  }
}



var ProfileImage               = require(path.join(__dirname, 'models', 'profile_image'));
var ProfileImageWithMiddleware = require(path.join(__dirname, 'models', 'profile_image_with_middleware'));
var ProfileImageWithPlugin     = require(path.join(__dirname, 'models', 'profile_image_with_plugin'));
var ProfileImageWithPreSave    = require(path.join(__dirname, 'models', 'profile_image_with_pre_save'));
var ProfileImageWithPreUpdate  = require(path.join(__dirname, 'models', 'profile_image_with_pre_update'));

var IncomeLevel                = require(path.join(__dirname, 'models', 'income_level'));



var saveAndLookup = function(model, doc, next) {
  if (typeof doc == 'function') {
    next = doc;
    doc = {test: 'test'};
  }
  model.create(doc, function(err, doc) {
    // console.log(o.attrs(doc));
    model.where({_id: doc._id}).findOne(function(err, doc) {
      next(err, doc);
    });
  });
}

describe("Mongoose Memories", function() {
  describe('Class', function() {
    it("class.create", function(done) {
      saveAndLookup(ProfileImage, function(err, doc) {
        expect(doc.test).to.equal('test');
        done();
      })
    });


    it("class.remove", function(done) {
      saveAndLookup(ProfileImage, function(err, doc) {
        ProfileImage.remove({_id: doc._id}, function() {
          ProfileImage.findOne({_id: doc._id}, function(err, doc) {
            expect(doc).to.equal(null);
            done();
          });
        });
      })
    });


    it("class.update", function(done) {
      saveAndLookup(ProfileImage, function(err, doc) {
        ProfileImage.update({_id: doc._id}, {plugin: true}, {}, function(err, docs) {
          var doc = docs[0]
            expect(doc.test).to.equal('test');
          done();
        });
      })
    });

    it("class.where().update().exec(next)", function(done) {
      saveAndLookup(ProfileImage, {test: 'test', tags: ['no', 'notin']}, function(err, doc) {
        ProfileImage.where({_id: doc._id}).update({plugin: true}).exec(function(err, docs) {
          var doc = docs[0]
            expect(doc.test).to.equal('test');
          done();
        });
      })
    });

    it("class.where().update().exec(next) $set", function(done) {
      saveAndLookup(ProfileImage, {test: 'test', tag: ['test', 'tag']}, function(err, doc) {
        ProfileImage.where({_id: doc._id}).update({$set: {setAttribute: true}}).exec(function(err, docs) {
          var doc = docs[0]
            expect(doc.setAttribute).to.equal(true);
          done();
        });
      })
    });
  });

  describe('Instance', function() {
    it("instance.save", function(done) {
      saveAndLookup(ProfileImage, function(err, doc) {
        doc.test = 'not a test';
        doc.save(function() {
          ProfileImage.findOne({_id: doc._id}, function(err, doc) {
            expect(doc.test).to.equal('not a test');
            done();
          });
        });
      })
    });

    it("instance.remove", function(done) {
      saveAndLookup(ProfileImage, {test: 'still not a test'}, function(err, doc) {
        doc.remove(function() {
          ProfileImage.findOne({_id: doc._id}, function(err, doc) {
            expect(doc).to.equal(null);
            done();
          });
        });
      })
    });
  });

  describe('Middleware', function() {
    it("pre.save", function(done) {
      saveAndLookup(ProfileImageWithPreSave, function(err, doc) {
        expect(doc.test).to.equal('test');
        done();
      })
    });

    it("pre.update", function(done) {
      saveAndLookup(ProfileImageWithPreUpdate, function(err, doc) {
        ProfileImageWithPreUpdate.update({_id: doc._id}, {plugin: true}, function(err, docs) {
          var doc = docs[0]
            expect(doc.preupdate.test).to.equal('test');
          expect(doc.test).to.equal('test');
          done();
        });
      })
    });

    it("middleware", function(done) {
      var response = {test: 'test'};
      ProfileImageWithMiddleware.create(response, function(err, doc) {
        expect(doc.test).to.equal('test');
        ProfileImageWithMiddleware.where({_id: doc._id}).findOne(function(err, doc) {
          expect(doc.doc.test).to.equal('test');
          done();
        });
      });
    });
  });

  describe("Plugins", function() {
    it("add pre save function", function(done) {
      var response = {test: 'test'};
      ProfileImageWithPlugin.create(response, function(err, doc) {
        expect(doc.test).to.equal('test');
        ProfileImageWithPlugin.where({_id: doc._id}).findOne(function(err, doc) {
          expect(doc.plugin.test).to.equal('test');
          expect(doc.toSave).to.equal('saved');
          done();
        });
      });
    });
  });

  describe("Query Combinations", function() {
    this.timeout(15000);
    before(function(done) {
      IncomeLevel.remove({}, function() { 
        var incomeCodes = ['LIC', 'LMC', 'NOC', 'UMC', 'LMY', 'HIC', 'HPC', 'OEC', 'MIC'];
        var income_data = {};
        _.each(incomeCodes, function(code) {
          download('http://api.worldbank.org/v2/incomeLevels/'+code+'/countries?format=json', 
            path.join(os.tmpdir(), 'incomeData-'+code+'.json'), function(err, file) {
            
            income_data[code] = require(path.join(os.tmpdir(), 'incomeData-'+code+'.json'))[1];

            _.each(income_data[code], function(data) {
              data.longitude = parseFloat(data.longitude);
              data.latitude = parseFloat(data.latitude);
              IncomeLevel.create(data, function() { 
                if (_.last(incomeCodes) == code && _.last(income_data[code]).id == data.id) {
                  done();
                }
              });
            })	
          });
        });
      });
    })

    it("where", function(done) {
      IncomeLevel.where({}).exec(function(err, doc) {
        // console.log(JSON.stringify(doc));
	done();
      });
    });
  });


})
