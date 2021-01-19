const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');


const height = window.innerHeight;
const width = window.innerWidth*1.1;
const margin = ({top: 20, right: 150, bottom: 30, left: 100})


class d3StackedBarChart extends D3Component {
  initialize(node, props) {
    const data = props.data

    var svg = d3.select(node).append('svg');
    const usd = 99767

    svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('width', '170%')
    .style('height', 'auto');


    var subgroups = d3.keys(data[0]).slice(2,6)

    var groups = d3.map(data, function(d){return(d.Currency)}).keys()

     // Add X axis
    var x = d3.scaleBand()
    .domain(groups)
    .range([margin.left, width - margin.right])  
    .padding([0.01])
    
    // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, 200000])
    .range([height - margin.bottom, margin.top])

    const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("font-size", "20px")
        .text("Total Cost of Minerva Cost in USD (2017 Value)"))

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
     .attr("class", 'xaxis')
     // .attr("transform", "rotate(90)")
      .call(d3.axisBottom(x).ticks(width/ 80).tickSizeOuter(0))

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);
      

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(d3.schemeSet2);

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
    .keys(subgroups)
    (data)

    var size = 20
    svg.selectAll("mydots")
      .data(subgroups)
      .enter()
      .append("rect")
      .attr("x", width - 340)
      .attr("y", function(d,i){ return height/8 + i*(size+20)})// 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return color(d)})

    svg.selectAll("mylabels")
    .data(subgroups)
    .enter()
    .append("text")
      .attr("x", width - 300)
      .attr("y", function(d,i){ return height/8 + 10 + i*(size+20)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

      // ----------------
  // Highlight a specific subgroup when hovered
  // ----------------

  // What happens when user hover a bar
  var mouseover = function(d) {
    // what subgroup are we hovering?
    var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
    var subgroupValue = d.data[subgroupName];
    // Reduce opacity of all rect to 0.2
    d3.selectAll(".myRect").style("opacity", 0.2)
    // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
    d3.selectAll("."+subgroupName)
      .style("opacity", 1);
    tooltip.style("display", null)
    }

  // When user do not hover anymore
  var mouseleave = function(d) {
    // Back to normal opacity: 0.8
    d3.selectAll(".myRect")
      .style("opacity",0.8);
    tooltip.style("display", "none")
    }

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = Currency per Currency
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.Currency); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("stroke", "white")
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .on("mousemove", function(d) {
        var total = Object.values(d.data).slice(2,6).reduce(function(a, b){
          return a + b;
      }, 0)
        var xPosition = d3.mouse(this)[0] - 15;
        var yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select(".currency_text_tooltip").text(d.data.FullCurrency);
        tooltip.select(".total_text_tooltip").text("Total Cost: $" + total + " USD");
        tooltip.select(".this_text_tooltip").text(d3.select(this.parentNode).datum().key + ": $" + (d[1] - d[0] )+ " USD");
      });


    svg.select(".xaxis")
      .selectAll('text')
      .attr("transform", "rotate(45)")
      .attr("dx", "1.5em")
      .attr("dy", "1em")

    var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
  
    
    tooltip.append("text")
      .attr("x", -70)
      .attr("y", "-5em")
      .attr("font-size", "25px")
      .attr("font-weight", "bold")
      .attr("class" , "currency_text_tooltip");

    tooltip.append("text")
      .attr("x", -70)
      .attr("dy", "-3em")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("class" , "this_text_tooltip");

    tooltip.append("text")
      .attr("x", -70)
      .attr("dy", "-2em")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("class" , "total_text_tooltip");

    svg.append("line")
      .attr("x1", margin.left+5)
      .attr("y1", y(usd))
      .attr("x2", width - margin.right)
      .attr("y2", y(usd))
      .attr("stroke-width", 2)
      .attr("stroke", "grey")
      .attr("opacity", "0.5");

    svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", y(usd-500))
      .attr("font-size", "13px")
      .text("usd total")

    svg.append("text")
      .attr("x", x("USD")+10)
      .attr("y", y(usd+20000))
      .attr("font-size", "15px")
      .text("Majority of currencies")
      .style("text-anchor", "middle")
    svg.append("text")
      .attr("x", x("USD")+10)
      .attr("y", y(usd+15000))
      .attr("font-size", "15px")
      .text("have depreciated")
      .style("text-anchor", "middle")
    svg.append("text")
      .attr("x", x("USD")+10)
      .attr("y", y(usd+10000))
      .attr("font-size", "15px")
      .text("versus the USD")
      .style("text-anchor", "middle")



    


  }

}

module.exports = d3StackedBarChart;
