var db;
var words = 0;
var exceptions = [];
var inText = [];
var output = [];
var wordsModified = [];
var noun = [];
var verb = []



$.get(
  "data",
  function(data){
    console.log(data);
    exceptions = data;
  }
)

$('#inText').on('keyup', function(){
  inText = $('#inText').val().split(" ");
  updateText(inText);
});

$('#synonymizeButton').on('click', function(){
  nlp.getParse($('#inText').val(), function(data){
    console.log(data);
    for (var i = 0; i < data.words.length; i++) {
      if(isException(data.words[i].value.toLowerCase())){
        console.log(data.words[i].value + " is an exception");
        output[i] = data.words[i].value;
      }
      else{
        console.log(data.words[i].value + "[tag]: " + data.words[i].tag);
        decryptTag(data.words[i].tag, function(grammar){
          if(grammar != "unknown"){
            getSynonym(data.words[i].value, grammar, i, function(modified){
              if(modified == null){
                console.log("Null modified???");
              }
              if(modified){
                wordsModified.push(i);
              }
              else{
                output[i] = data.words[i].value;
              }
              updateText(output);
            });
          }
          else{
            output[i] = data.words[i].value;
          }
        });
      }
    }
  });
});

var getSynonym = function(word, grammar, index, callback){
  console.log("Fetching synonym for " + word + " with gramar context: " + grammar);
  $.post(
    '/synonymize',
    data = {value: word},
    success = function(value, status, jqXHR) {
      if(value.syn) {
        switch(grammar)
        {
        case "noun":
          if(value.noun){
            output[index] = value.noun[0]; 
            callback(true);
          }
          else callback(false);
          break;
        case "verb":
          if(value.verb){
            output[index] = value.verb[0];
            callback(true);
          }
          else callback(false);
          break;
        case "adjective":
          if(value.adj){
            output[index] = value.adj[0];
            callback(true);
          }
          else callback(false);
          break;
        default:
          console.log("Not a noun, verb, or adjective. Data returned from server: " + value);
          callback(false);
        }
      }
      else{
        console.log("Got to the else... \nWord: " + word + '\nValues: ' + values + "\nGrammar: " + grammar);
        // alert("Out of API calls, email: martin@magingras.com");
      }
      callback(null);
    }
  );
}

var isException = function(word) {
  if($.inArray(word, exceptions) > -1){
    return true;
  }
  return false;
}

function updateText(text){
  $('#outText').html(text.join(" "));
}

var decryptTag = function(tag, callback){
  switch(tag)
  {
  case "NN":
    callback("noun"); // noun, common, singular or mass
    break;
  case "NNP":
    callback("noun"); // noun, proper, singular
    break;
  case "NNPS":
    callback("noun"); // noun, proper, plural
    break;
  case "NNS":
    callback("noun"); // noun common, plural
    break;
  case "RB":
    callback("adverb"); // adverb
    break;
  case "RBR":
    callback("adverb"); //adverb comparitive
    break;
  case "RBS":
    callback("adverb"); // adverb superlative
    break;
  case "VB":
    callback("verb"); // verb, base form
    break;
  case "VBD":
    callback("verb"); // verb, past tense
    break;
  case "VBG":
    callback("verb"); //verb, present particular
    break;
  case "VBN":
    callback("verb"); // verb, past particular
    break;
  case "VBP":
    callback("verb"); // verb, present tense, not 3rd person singular
    break;
  case "VBZ":
    callback("verb"); // verb, present tense, 3rd person singular
    break;
  case "JJ":
    callback("adjective"); // adjective
    break;
  case "JJR":
    callback("adjective"); //adjective comparative
    break;
  case "JJS":
    callback("adjective"); // adjective superlatve
  default:
    callback("unknown");
  }
} 
