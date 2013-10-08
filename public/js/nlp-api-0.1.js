var nlp = {};
nlp.getParse = function(text, callback)
{
  if (text.length > 250)
  {
    // If more than 250 be really stupid and call everything a noun... 
    var words = text.split(" ");
    var obj = {words:[words.length]};
    for (var i = 0; i < words.length; i++) {
      obj.words[i] = {value:words[i], tag:"NN"};
    }
    callback(obj);
    // return false; //"ERROR: input length greater than 250 characters. Please parse one sentence at a time";
  }
  else
  {
    var url = 'http://nlp.naturalparsing.com/api/parse?input=?format=json&jsoncallback='+encodeURIComponent(callback)+'&input=' + encodeURIComponent(text) +"&version=0.1&options=sentence";
    var script = document.createElement("script");
    script.setAttribute("async", "true");
    script.setAttribute("src", url);
    script.setAttribute("type", "text/javascript");
	
    document.body.appendChild(script);
    return true;
  }
};

nlp.getParsedTree = function(text, callback)
{
  if (text.length >250)
  {

    return false; //"ERROR: input length greater than 250 characters. Please parse one sentence at a time";
  }
  else
  {
    var url = 'http://nlp.naturalparsing.com/api/parse?input=?format=json&jsoncallback='+encodeURIComponent(callback)+'&input=' + encodeURIComponent(text) +"&version=0.1&options=tree";
    var script = document.createElement("script");
    script.setAttribute("async", "true");
    script.setAttribute("src", url);
    script.setAttribute("type", "text/javascript");
	
    document.body.appendChild(script);
    return true;
  }
};

nlp.JSONtoString = function(data)
{
  if (data.words == null )
  {
    return;
  }
  else 
  {
    var x;
    var output = "";
    for (x in data.words)
    {
      output = output + data.words[x].value + "/" + data.words[x].tag + " ";
    }
    return output
  }
};