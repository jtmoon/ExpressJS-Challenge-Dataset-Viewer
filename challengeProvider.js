var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

var ChallengeProvider = function(host, port) {
  this.db = new Db('test', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
}

ChallengeProvider.prototype.getCollection = function(callback) {
  this.db.collection('challenges', function(error, challenge_collection) {
    if(error) callback(error);
    else callback(null, challenge_collection);
  });
};

ChallengeProvider.prototype.insertJSON = function(jsonList, overwrite, callback) {
  this.getCollection(function(error, challenge_collection) {
    if(overwrite) {
      challenge_collection.remove({}, function() {
        console.log('Docs removed');
      });
    }
    else {
    }
  });
};

ChallengeProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, challenge_collection) {
    if(error) callback(error);
    else {
      challenge_collection.find().sort({'record.organization':1}).toArray(function(error, results) {
        if(error) callback(error);
        else callback(null, results);
      });
    }
  });
};

ChallengeProvider.prototype.generateOrgList = function(callback) {
  this.getCollection(function(error, challenge_collection) {
    if(error) callback(error);
    else {
      challenge_collection.find().sort({'record.overall_federal_agency':1}).toArray(function(error, results) {
        if(error) callback(error);
        else {
          for(var x in results) {
            if(results[x]._id === 'organizations') x++;
            challenge_collection.update(
              {'_id':'organizations'},
              {'$addToSet': {'orgList': results[x].record.overall_federal_agency}},
              {'upsert': true},
              function() {
                x++;
                if(x >= results.length) {
                  console.log('called');
                  challenge_collection.findOne({'_id':'organizations'}, function(error, result) {
                    if(error) callback(error);
                    else callback(null, result);
                  });
                }
              }
            );
          }
        }
      });
    }
  });
};

ChallengeProvider.prototype.findByField = function(field, callback) {
  this.getCollection(function(error, challenge_collection) {
    if(error) callback(error);
    else {
      challenge_collection.find(field).toArray(function(error, results) {
        if(error) callback(error);
        else callback(null, results);
      });
    }
  });
};

ChallengeProvider.prototype.findCountByField = function(field, callback) {
  this.getCollection(function(error, challenge_collection) {
    if(error) callback(error);
    else {
      challenge_collection.count(field, function(error, count) {
        if(error) callback(error);
        else callback(null, count);
      });
    }
  });
};
exports.ChallengeProvider = ChallengeProvider;