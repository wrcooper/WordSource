var space = " ";
var endings = [".", ",", "'", ";"];

function generateText(nodes, count){
  removeSVG();
  
  var generatedText = "";
  // Choose a starting node
  var node = nodes[0];
  generatedText += node.token;
  for (var i = 0; i < count; i++){
    // Randomly choose the next node based on probability
    node = node.generateNext();
    generatedText = addToken(generatedText, node.token);
    // Repeat until target word count reached
  }
  
  return generatedText;
}

function addToken(string, token){
  if (!endings.includes(token)) string += space;
  if (token == "i") token = "I";
  string += token;
  return string;
}