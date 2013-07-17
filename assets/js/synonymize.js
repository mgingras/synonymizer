var db;
var words = 0;
var exceptions = [];
var inText = [];
var output = [];
var wordsModified = [];


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
  inText = $('#inText').val().split(" ");
  var inLen = inText.length;
  // Word selection algorithm goes here -> Better than every modified word
  for (var i = 0; i < inLen; i++) {
    if(isException(inText[i].toLowerCase())){
      console.log(inText[i] + " is an exception");
      output[i] = inText[i];
    }
    else{
      var syn = getSynonym(inText[i], i, function(){
        wordsModified.push(i);
        updateText(output);
      });
    }
  }
});

function getSynonym(word, index, callback){
  $.post(
    '/synonymize',
    data = {value: word},
    success = function(value, status, jqXHR) {
      if(value.syn){
        if(value.noun){
          output[index] = value.noun[0];
        }
        else if(value.verb){
          output[index] = value.verb[0];
        }
        else if(value.adj){
          output[index] = value.adj[0];
        }
      }
      else if(value){
        exceptions.push(value);
        output[index] = value;
      }
      else{
        // alert("Got to the else... \nWord: " + word + '\nValues: ' + values);        
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
