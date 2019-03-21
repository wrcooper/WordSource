function drawConcordance(list, count){
  removeSVG();
  
  const margin = 60;
  const width = 1500 - 2 * margin;
  const height = 600 - 2 * margin;
  const phrase_offset = 25;

  const svg = d3.select('svg')
    .style('width', '1500px')
    .style('background-color', 'white');
    
  if (list.length == 0){
    svg.append('text')
      .attr('x', width/2 + margin)
      .attr('y', height/2)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('fill', 'black')
      .text("No Matches")
  }
    
  for (var i = 0; i < list.length; i++){
    if (i == count) break;
    svg.append('text')
      .attr('x', width/2 + margin)
      .attr('y', 30 + i * phrase_offset)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('fill', 'black')
      .text(list[i])
  }
}