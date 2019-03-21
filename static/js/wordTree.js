
var width = 1800;
var height = 1600;

var maxDepth = 3;
var maxChildren = 8;
var currentNodeIndex;
  
displayID = 0;

var cur_index = 0;

class DisplayNode{
  constructor(node, i){
    this.id = displayID++;
    this.name = node.name;
    this.children = [];
    var j = i - 1;
    if (i > 1) {
      for (var index in node.children){
        var child = new DisplayNode(node.children[index], j);
        
        var thisNode = this;
        var probNode = probabilityNodeArray.find(function(probNode){
          return thisNode.name == probNode.token;
        });
        
        if (probNode != undefined) {
          var probability = calculatePercOccurance(probNode.tokens, child.name, probNode.count);
          child.prob = probability;
        }
        
        console.log(this.name + ": " + child.name + " - " + probability);
        if(!Number.isNaN(child.name)) this.children.push(child);
      }
    }
  }
}

// sorts by probability and includes only first n
function sortAndInclude(node, n){
  node.children.sort(function(a, b) {return b.prob - a.prob});
  var removed = node.children.splice(n, node.children.length - n);
  
  var max = 0;
  for (var i in node.children){
    if (node.children[i].prob > max) max = node.children[i].prob;
  }
  var color = d3.scaleLinear()
      .domain([0, max])
      .range(["rgb(243, 23, 45)", "rgb(124,252,0)"]);
      
  if (removed.length != 0) {
    var moreNode = new Object;
    moreNode.name = "<more>";
    var more = new DisplayNode(moreNode, 0);
    node.children.push(more);
  }
  for (var i in node.children){
    if (node.children[i].children != undefined) sortAndInclude(node.children[i], n);
    node.children[i].color = node.children[i].prob ? color(node.children[i].prob) : "#fff";
  }
}

function calculatePercOccurance(tokens, token, total){
  var count = 0;
  for (var i = 0; i < tokens.length; i++){
    if (tokens[i] == token) count++;
  }
  return ((count/total) * 100).toFixed(2);
}
  
function drawTree(nodes){
  removeSVG();
  
  var svg = d3.select("svg");
    
  d3.select("svg")
    .style("width", width.toString())
    .style('height', height.toString());

   d3.csv("./../static/flare.csv", function(error, data) {
    if (error) throw error;
    
    drawRoot(nodes, cur_index);
  });
  
}


function drawRoot(nodes, index){
  var svg = d3.select("svg");
  
  var tree = d3.tree()
    .size([height - 100, width - 700]);
  
  var new_root = new DisplayNode(nodes[index], maxDepth);
  sortAndInclude(new_root, maxChildren);
  
  var hierarch = d3.hierarchy(new_root, function(d){
    return ( d.children );
  });

  var links = tree(hierarch);
  
  console.log(links);

  tree(links);
    
  var g = svg.append("g").attr("transform", "translate(400,50)");
  
  var link = g.selectAll(".link")
      .data(links.descendants().slice(1))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = g.selectAll(".node")
      .data(links.descendants())
    .enter().append("g")
      .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  node.append("circle")
      .attr("r", 2.5);

  node.append("text")
      .attr("dy", function(d) { if (d.data.name == "<more>" && d.depth != maxDepth - 1) return 8; return d.children ? 4 : 3; })
      .attr("x", function(d) { if (d.data.name == "<more>" && d.depth != maxDepth - 1) return -10; return d.children ? -10 : 10; })
      .style("text-anchor", function(d) {if (d.data.name == "<more>" && d.depth != maxDepth - 1) return "end"; return d.children ? "end" : "start"; })
      .style("text-shadow", "2px 2px #000")
      .style("fill", function(d){return d.data.color ? d.data.color : "#fff"})
      .attr('onmouseover', '')
      .style('cursor', 'pointer')
      .text(function(d) { return d.data.name; })
      .style("font-size", function(d) {
        if (d.depth == 0) return 54;
        else if (d.depth == 1) return 30;
        else if (d.depth == 2) return 24;
        else return 16;
      })
      .on("click", function (s){
        changed(s, nodes);
      })
      
  node.append("text")
      .attr("dy", function(d) { if (d.depth > 3) return d.children ? -8 : -5; return d.children ? -25 + ((d.depth - 1) * 8) : -5; })
      .attr("x", function(d) { return d.children ? 0 : 0; })
      .attr('onmouseover', '')
      .style('cursor', 'pointer')
      .style("text-anchor", function(d) { return d.children ? "end" : "end"; })
      .style("text-shadow", "2px 2px #000")
      .text(function(d) { return d.data.prob ? d.data.prob + "%" : ""; })
      .style("font-size", function(d) {
        if (d.depth == 0) return 36;
        else if (d.depth == 1) return 24;
        else if (d.depth == 2) return 16;
        else return 12;
      })
      .on("click", function (s){
        changed(s, nodes);
      })
      
  function changed(s, nodes) {
      if (s.data.name == "<more>") return;
      d3.selectAll("svg > *").remove();
      
      console.log(s);
      console.log(nodes);
      
      var root = nodes.find(function(node){
        return node.name == s.data.name;
      });
      
      console.log(root);
      
      var index = nodes.indexOf(root);
      cur_index = index;
      console.log(index);
     
      drawRoot(nodes, index);
      var t = d3.transition().duration(750);
      node.transition(t).attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
      link.transition(t).attr("d", diagonal);
    }
}

function diagonal(d) {
  return "M" + d.y + "," + d.x
      + "C" + (d.parent.y + 100) + "," + d.x
      + " " + (d.parent.y + 100) + "," + d.parent.x
      + " " + d.parent.y + "," + d.parent.x;
}