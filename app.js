const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

//create an SVG wrapper, append an SVG group that will hold the chart, and shift the latter by left and top margins
const svg = d3.select('.chart')
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//import data
d3.csv('combined_data.csv', function(err, combData) {
  if (err) throw err;

  //parse data, cast as numbers
  combData.forEach(function(data) {
    data.insurance = +data.poverty;
    data.checkup = +data.income;
  });

  //create scale functions
  let xLinearScale = d3.scaleLinear()
    .domain([0, d3.max(combData, d => d.poverty)])
    .range([0, width]);

  let yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(combData, d => d.income)])
    .range([height, 0]);

  //create axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  //append the axes to the chart
  chartGroup.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);

  chartGroup.append('g')
    .call(leftAxis);

  //create circles
  let circlesGroup = chartGroup.selectAll('circle')
    .data(combData)
    .enter()
    .append('circle')
    .attr('cx', d => xLinearScale(d.poverty))
    .attr('cy', d => yLinearScale(d.income))
    .attr('r', '15')
    .attr('fill', '#158CBA')
    .attr('opacity', '.5');

  //add state labels to nodes
  let circleText = chartGroup.selectAll(null)
    .data(combData)
    .enter()
    .append('text')
    // .classed("circles-text", true)
          
  let textLabels = circleText
    .attr('x', d => xLinearScale(d.poverty))
    .attr('y', d => (yLinearScale(d.income) * 1.08))
    .style('text-anchor', 'middle')
    .style('font-size', '9px')
    .text(d => d.state)

  //initialize tool tip
  let toolTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([80, -60])
    .html(function(d) {
      return ( `<strong>${d.state_full}</strong><br>Poverty Rate: 
      ${d.poverty}%<br>HH Income: 
      ${d.income}`);
    });

  //creat tooltip in the chart
  chartGroup.call(toolTip);

  //create event listeners to display and hide the tooltip
  circlesGroup.on('mouseover', function(data) {
    toolTip.show(data);
  })
    //mouseout
    .on('mouseout', function(data, index) {
      toolTip.hide(data);
    });

  //create axes labels
  chartGroup.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 20)
    .attr('x', 0 - (height / 2))
    .attr('dy', '1em')
    .attr('class', 'axisText')
    .text('State Median Household Income');
  
  chartGroup.append('text')
    .attr('transform', `translate(${width / 2}, ${height + 
      margin.top + 30})`)
    .attr('class', 'axisText')
    .text('State Poverty Rate');
});

