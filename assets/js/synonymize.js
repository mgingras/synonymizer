var exceptions = [];
var output = [];
var wordsModified = [];

$.get(
  "data",
  function(data){
    // console.log(data);
    exceptions = data;
  }
)

$('#inText').on('keyup', function(){
  updateText($('#inText').val().split(" "));
});

$('#synonymizeButton').on('click', function(){
  output = [];
  nlp.getParse($('#inText').val(), function(data){
    // console.log(data);
    for (var i = 0; i < data.words.length; i++) {
      if(isException(data.words[i].value.toLowerCase())){
        // console.log(data.words[i].value + " is an exception");
        output[i] = data.words[i].value;
      }
      else{
        decryptTag(data.words[i].tag, function(grammar){
          if(grammar == "unknown") output[i] = data.words[i].value;
          else{
            synonymize(data.words[i].value, grammar, i, function(word, index){
              output[index] = word;
              if(data.words[index].value != word) wordsModified.push(index);
              updateText(output);
            });
          }
        });
      }
    }
  });
});

var synonymize = function(word, grammar, index, callback){
  // console.log("Fetching synonym for " + word + " with gramar context: " + grammar);
  $.post('/synonymize',
    data = {value: word, context: grammar},
    function(value) {
      if(value != word){
        console.log("Server returned " + value + " as a synonym for " + word);
        callback(value, index);
      }
      else{
        console.log("Server did not return a synonym, queried:" + word + " and returned " + value);
        exceptions.push(value);
        callback(value, index);
      }
    }
  );
}

function randomSyn(values) {
  return(values[Math.floor(Math.random() * (values.length))]);
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
    console.log("decrypt Tag failed on tag: " + tag);
    callback("unknown");
  }
} 
