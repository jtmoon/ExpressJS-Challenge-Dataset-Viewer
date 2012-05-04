
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

var ChallengeProvider = require('./challengeProvider.js').ChallengeProvider;
var challengeProvider = new ChallengeProvider('localhost', 27017);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

function generateOrgList(req, res, next) {
  challengeProvider.generateOrgList(function(error, orgList) {
    req.orgList = orgList;
    next();
  });
};

// Routes

app.get('/', generateOrgList, function(req, res) {
  challengeProvider.findAll(function(error, challenges) {
    res.render('index', {locals: {
      challenges: challenges,
      orgList: req.orgList
    }});
  })
});

app.get('/:key', generateOrgList, function(req, res) {
  var field = {};
  if(!req.query.val) {
    res.redirect('/');
  }
  else if(req.query.val) {
    var key = 'record.' + req.params.key;
    field[key] = req.query.val;
    challengeProvider.findByField(field, function(error, challenges) {
      res.render('index', {locals: {
        challenges: challenges,
        orgList: req.orgList
      }});
    });
  }
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
