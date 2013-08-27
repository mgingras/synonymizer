/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title:'Synonymizer' });
};

/*
 * POST When new words need to be queried from Thesaurus API
 */
exports.synonymize = function(req, res){
  /* Make the API call to get the synonym */
  getSynonym(req.body.value, req.body.context, function(val) {
    if(val) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(val);
    }
    else {
      res.end();
    }
  });
};

/*
*  GET server to ping MongoDB to verify it has latest version of data
*/

exports.data = function(req, res){
  getExceptions(function(exceptions){
    if(exceptions){
      res.send(exceptions);
    }
  });
}
