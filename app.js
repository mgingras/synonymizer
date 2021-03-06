/**
* Module dependencies.
*/


var express = require('express')
, routes = require('./routes')
, newrelic = require('newrelic')
, compressor = require('node-minify')
, path = require('path')
, http = require('http')
, mongo = require('mongodb');

var app = express();

var MONGO_URI = process.env.MONGOLAB_URI;
var API_KEY = process.env.API_KEY;

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('title', 'Synonymizer');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
app.use(express.favicon());

new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'assets/js/synonymize.js',
  fileOut: 'public/js/synonymize.min.js',
  callback: function(err){
    if(err) console.log("minify: " + err);
  }
});
new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'assets/js/anal.js',
  fileOut: 'public/js/anal.min.js',
  callback: function(err){
    if(err) console.log("minify: " + err);
  }
});
new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'assets/js/add2home.js',
  fileOut: 'public/js/add2home.min.js',
  callback: function(err){
    if(err) console.log("minify: " + err);
  }
});

// development only configuration
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.locals.pretty = true;
});

// production configuration
app.configure('production', function(){
  app.use(express.errorHandler());
});


// Getting synonyms
getSynonym = function(word, grammar, callback){
  console.log("Word Queried: " + word + ", With Grammar: " + grammar);
  
  var options = {
    host: 'words.bighugelabs.com',
    path: '/api/2/' + API_KEY + '/' + word + '/json'
  };
  console.log("API request to URL: " + options.host + options.path);
    http.get(options, function(res) {
    var data = '';
    console.log('API response statusCode: ' + res.statusCode);
    
    // Word not found or alternative suggestion (neither which we want)
    if(res.statusCode == '404' || res.statusCode == '303' || res.statusCode == '500'){
      console.log('Handling ' + res.statusCode + ' response');
      if(res.statusCode == '500' ){
        console.log('Usage limits have been exceeded... Impressive!');
      }
      else{
        // Words get added to MongoDB to avoid excessive API calls in future
        addException(word);
      }
      // HTTP keeps conneciton open unless data is consumed...
      res.on('data', function() {});  // consume data!
      callback(word);
      return;
    }
    res.on('data', function(chunk) {
      data += chunk;
      // console.log('BODY: ' + chunk);
    });
    res.on('end', function () {
      data = JSON.parse(data);
      // console.log("For: [" + word + "]: " + JSON.stringify(data));
      switch (grammar)
      {
      case "noun":
        if(data.noun){
          if(data.noun.syn){
            word = randomSyn(data.noun.syn);
          }
        }
        break;
      case "verb":
        if(data.verb){
          if(data.verb.syn){
            word = randomSyn(data.verb.syn);
          }
        }
        break;
      case "adjective":
        if(data.adjective){
          if(data.adjective.syn){
            word = randomSyn(data.adjective.syn);
          }
        }
        break;
      default:
        console.log("No synonyms for " + word + " with context, " + grammar + " Data returned from server: " +  JSON.stringify(data));
      }
      console.log("Returning: " + word);
      callback(word);
    });
  }).on('error', function(e) {
    console.log('ERROR: ' + e.message);
    console.log(e.stack);
  });
};

// Helper function to choose random synonym
function randomSyn(synonyms) {
  return(synonyms[Math.floor(Math.random() * (synonyms.length))]);
}


var exceptions = [];

// Get all the exceptions from mongoDb database
getExceptions = function(callback){
  mongo.connect(MONGO_URI, function(err, db){
    db.collection('data').find({ "_id" : 1}).toArray(function(err, results){
      // console.log("Exceptions from MongoDB: " + results[0].exceptions);
      exceptions = results[0].exceptions;
      callback(exceptions);
      db.close();
    });
  });
}

//Add exception to mongoDB
var addException = function(word) {
  console.log("adding exception for: " + word);  
  mongo.connect(MONGO_URI, function(err, db){
    db.collection('data').findAndModify(
      ({ "_id" : 1}), // query
      [],
      {$push: {exceptions: word}},
      {},
      function(err, object) {
        if (err) console.warn(err.message);
        // else console.dir(object);
        db.close();
      }
    );
  });
}

// Routes
app.get('/', routes.index);
app.get('/data', routes.data);
app.post('/synonymize', routes.synonymize);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
