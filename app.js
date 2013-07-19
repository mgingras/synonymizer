
/**
* Module dependencies.
*/

var express = require('express')
, routes = require('./routes')
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
getSynonym = function(word, callback){
  console.log("Word Queried: " + word);
  var options = {
    host: 'words.bighugelabs.com',
    path: '/api/2/' + API_KEY + '/' + word + '/json'
  };
  
  console.log("API request to URL: " + options.host + options.path);
  
  http.get(options, function(res) {
    var data = '';
    console.log('API response statusCode: ' + res.statusCode);
    
    // Word not found or alternative suggestion (neither which we want)
    if(res.statusCode == '404' || res.statusCode == '303'){
      console.log('Handling ' + res.statusCode + ' response');
      // Words get added to MongoDB to avoid excessive API calls in future
      addException(word);
      callback(word);
      return
    }
    if(res.statusCode == '500' ){
      console.log('Usage limits have been exceeded... Impressive!');
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
      values = {};
      if(data.noun){
        if(data.noun.syn){
          values.syn = true;
          values.noun = data.noun.syn;
          // console.log("nouns: "+ data.noun.syn);
        }
      }
      if(data.verb){
        if(data.verb.syn){
          values.syn = true;
          values.verb = data.verb.syn;
          // console.log("verbs: "+ data.verb.syn);
        }
      }
      if(data.adjective){
        if(data.adjective.syn){
          values.syn = true;
          values.adj = data.adjective.syn;
          // console.log("adjective: "+ data.adjective.syn);
        }
      }
      if(!values.syn) {
        console.log("No Synonyms found for: " + word + " (should have gotten a 303 or 404)");
        callback(word); //an error occurred, should be 404 page...
        return;
      }
      callback(values);
    });
  }).on('error', function(e) {
    console.log('ERROR: ' + e.message);
    console.log(e.stack);
  });
}

var exceptions = [];

// Get all the exceptions from mongoDb database
getExceptions = function(callback){
  mongo.connect(MONGO_URI, function(err, db){
    db.collection('data').find({ "_id" : 1}).toArray(function(err, results){
      console.log("Exceptions from MongoDB: " + results[0].exceptions);
      exceptions = results[0].exceptions;
      callback(exceptions);
      db.close();
    });
  });
}

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
        else console.dir(object);
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
