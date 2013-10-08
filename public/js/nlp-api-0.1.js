var nlp = {};

// grep(ary[,filt]) - filters an array
//   note: could use jQuery.grep() instead
// @param {Array}    ary    array of members to filter
// @param {Function} filt   function to test truthiness of member,
//   if omitted, "function(member){ if(member) return member; }" is assumed
// @returns {Array}  all members of ary where result of filter is truthy
function grep(ary,filt) {
  var result=[];
  for(var i=0,len=ary.length;i++<len;) {
    var member=ary[i]||'';
    if(filt && (typeof filt === 'Function') ? filt(member) : member) {
      result.push(member);
    }
  }
  return result;
}

nlp.getParse = function(text, callback)
{
  if (text.length > 250)
  {
    
    var punct='\\['+ '\\!'+ '\\"'+ '\\#'+ '\\$'+   // since javascript does not
    '\\%'+ '\\&'+ '\\\''+ '\\('+ '\\)'+  // support POSIX character
    '\\*'+ '\\+'+ '\\,'+ '\\\\'+ '\\-'+  // classes, we'll need our
    '\\.'+ '\\/'+ '\\:'+ '\\;'+ '\\<'+   // own version of [:punct:]
    '\\='+ '\\>'+ '\\?'+ '\\@'+ '\\['+
    '\\]'+ '\\^'+ '\\_'+ '\\`'+ '\\{'+
    '\\|'+ '\\}'+ '\\~'+ '\\]',

    re=new RegExp(     // tokenizer
      '\\s*'+            // discard possible leading whitespace
      '('+               // start capture group
      '\\.{3}'+            // ellipsis (must appear before punct)
      '|'+               // alternator
      '\\w+\\-\\w+'+       // hyphenated words (must appear before punct)
      '|'+               // alternator
      '\\w+\'(?:\\w+)?'+   // compound words (must appear before punct)
      '|'+               // alternator
      '\\w+'+              // other words
      '|'+               // alternator
      '['+punct+']'+        // punct
      ')'                // end capture group
    );
    
    
    // If more than 250 be really stupid and call everything a noun... 
    var words = grep( text.split(re) );
    // var words = text.split(/\W+/);
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