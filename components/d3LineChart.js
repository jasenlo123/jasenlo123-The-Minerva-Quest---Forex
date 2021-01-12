const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const height = 550;
const width = 1000;
const margin = ({top: 20, right: 70, bottom: 30, left: 50})
const sems = ['2017','2018','2019','2020']
const parser = d3.utcParse("%B %d, %Y")
const ymin = 20000

class d3LineChart extends D3Component {
  initialize(node, props) {
    const data = props.data
    const mappedDates = data.dates.map(x => parser(x));
    console.log(mappedDates)

    var svg = d3.select(node).append('svg');

    svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('width', '170%')
    .style('height', 'auto');

    const y = d3.scaleLinear()
      //.domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
      .domain([ymin, props.upper]).nice()
      .range([height - margin.bottom, margin.top])

    const x = d3.scaleUtc()
      .domain(d3.extent(mappedDates)).nice()
      .range([margin.left, width - margin.right])  
      

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("font-size", "15px")
          .text("USD (2017 Value)"))

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width/ 80).tickSizeOuter(0))

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);


    const line = d3.line()
      .defined(d => !isNaN(d))
      .x((d, i) => x(mappedDates[i]))
      .y(d => y(d))


      function hover(svg, path) {
        svg
            .style("position", "relative");
        
        if ("ontouchstart" in document) svg
            .style("-webkit-tap-highlight-color", "transparent")
            .on("touchmove", moved)
            .on("touchstart", entered)
            .on("touchend", left)
        else svg
            .on("mousemove", moved)
            .on("mouseenter", entered)
            .on("mouseleave", left);
      
        const dot = svg.append("g")
            .attr("display", "none");
      
        dot.append("circle")
            .attr("r", 2.5);
      
        dot.append("text")
            .style("font", "10px sans-serif")
            .attr("text-anchor", "middle")
            .attr("class", "val")
            .attr("y", -8);
  
        dot.append("text")
            .style("font", "10px sans-serif")
            .attr("text-anchor", "middle")
            .attr("class", "cur")
            .attr("y", 20);
        dot.append("text")
            .style("font", "10px sans-serif")
            .attr("text-anchor", "middle")
            .attr("class", "studs")
            .attr("y", 30);
  
        const dot2 = svg.append("g")
            .attr("display", "none");
      
        dot2.append("circle")
            .attr("r", 2.5);
      
        dot2.append("text")
            .style("font", "10px sans-serif")
            .attr("text-anchor", "middle")
            .attr("class", "val")
            .attr("y", -8);
  
        dot2.append("text")
            .style("font", "10px sans-serif")
            .attr("text-anchor", "middle")
            .attr("class", "cur")
            .attr("y", 20);
            
      
        function moved() {
          d3.event.preventDefault();
          const ym = y.invert(d3.event.layerY);
          const xm = x.invert(d3.event.layerX);
          const i1 = d3.bisectLeft(mappedDates, xm, 1);
          const i0 = i1 - 1;
          const i = xm - mappedDates[i0] > data.dates[i1] - xm ? i1 : i0;
          const s = data.series.reduce((a, b) => Math.abs(a.values[i] - ym) < Math.abs(b.values[i] - ym) ? a : b);
          path.attr("stroke", d => d.currency === props.highlight? 'red' : d.currency === s.currency ? null : d.currency === "United States Dollar" ? "black" :  "#ddd").filter(d => d === s).raise();

          dot2.attr("transform", `translate(${x(mappedDates[i])},${y(data.series[59].values[i])})`);
          dot2.select(".cur").text("United States Dollar");
          dot2.select(".val").text(sems[i] + ': $' + data.series[59].values[i] + ' USD');
  
          dot.attr("transform", `translate(${x(mappedDates[i])},${y(s.values[i])})`);
          dot.select(".cur").text(s.currency);
          dot.select(".val").text(sems[i] + ': $' + s.values[i] + ' USD  ');
          dot.select(".studs").text(s.students + " students");
  
  
        }
    
      function entered() {
        path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        dot.attr("display", null);
        dot2.attr("display", null);

      }
    
      function left() {
        path.style("mix-blend-mode", "multiply")
          .attr("stroke", d => d.currency === "United States Dollar"? 'black' : d.currency === props.highlight? 'red' :  "steelblue")
        dot.attr("display", "none");
        dot2.attr("display", "none");

      }
    }

    const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .enter()
    .append('path')
     .attr("stroke", d => d.currency === "United States Dollar"? 'black' : d.currency === props.highlight? 'red' :  "steelblue")
      .style("mix-blend-mode", "multiply")
      .attr("d", d => line(d.values))
   .attr("opacity", d => d.currency === props.highlight? 1 : d.students/2)
   .attr("stroke-width", d => d.currency === props.highlight? 3 : d.students/10);
  

    svg.call(hover, path); 
  }
  update(props) {
    var svg = d3.select('svg');

    const data = props.data
    const mappedDates = data.dates.map(x => parser(x));

    svg.selectAll('g')
      .remove()

    svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('width', '170%')
    .style('height', 'auto');

    const y = d3.scaleLinear()
      //.domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
      .domain([ymin, props.upper]).nice()
      .range([height - margin.bottom, margin.top])

    const x = d3.scaleUtc()
      .domain(d3.extent(mappedDates)).nice()
      .range([margin.left, width - margin.right])  
      

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .attr("font-size", "15px")
          .text("USD (2017 Value)"))

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width/ 80).tickSizeOuter(0))

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);


    const line = d3.line()
      .defined(d => !isNaN(d))
      .x((d, i) => x(mappedDates[i]))
      .y(d => y(d))


  function hover(svg, path) {
      svg
          .style("position", "relative");
      
      if ("ontouchstart" in document) svg
          .style("-webkit-tap-highlight-color", "transparent")
          .on("touchmove", moved)
          .on("touchstart", entered)
          .on("touchend", left)
      else svg
          .on("mousemove", moved)
          .on("mouseenter", entered)
          .on("mouseleave", left);
    
      const dot = svg.append("g")
          .attr("display", "none");
    
      dot.append("circle")
          .attr("r", 2.5);
    
      dot.append("text")
          .style("font", "10px sans-serif")
          .attr("text-anchor", "middle")
          .attr("class", "val")
          .attr("y", -8);

      dot.append("text")
          .style("font", "10px sans-serif")
          .attr("text-anchor", "middle")
          .attr("class", "cur")
          .attr("y", 20);
      dot.append("text")
          .style("font", "10px sans-serif")
          .attr("text-anchor", "middle")
          .attr("class", "studs")
          .attr("y", 30);

      const dot2 = svg.append("g")
          .attr("display", "none");
    
      dot2.append("circle")
          .attr("r", 2.5);
    
      dot2.append("text")
          .style("font", "10px sans-serif")
          .attr("text-anchor", "middle")
          .attr("class", "val")
          .attr("y", -8);

      dot2.append("text")
          .style("font", "10px sans-serif")
          .attr("text-anchor", "middle")
          .attr("class", "cur")
          .attr("y", 20);
          
    
      function moved() {
        d3.event.preventDefault();
        const ym = y.invert(d3.event.layerY);
        const xm = x.invert(d3.event.layerX);
        const i1 = d3.bisectLeft(mappedDates, xm, 1);
        const i0 = i1 - 1;
        const i = xm - mappedDates[i0] > data.dates[i1] - xm ? i1 : i0;
        const s = data.series.reduce((a, b) => Math.abs(a.values[i] - ym) < Math.abs(b.values[i] - ym) ? a : b);
        path.attr("stroke", d => d.currency === props.highlight? 'red' : d.currency === s.currency ? null : d.currency === "United States Dollar" ? "black" :  "#ddd").filter(d => d === s).raise();

        dot2.attr("transform", `translate(${x(mappedDates[i])},${y(data.series[59].values[i])})`);
        dot2.select(".cur").text("United States Dollar");
        dot2.select(".val").text(sems[i] + ': $' + data.series[59].values[i] + ' USD');

        dot.attr("transform", `translate(${x(mappedDates[i])},${y(s.values[i])})`);
        dot.select(".cur").text(s.currency);
        dot.select(".val").text(sems[i] + ': $' + s.values[i] + ' USD  ');
        dot.select(".studs").text(s.students + " students");


      }
    
      function entered() {
        path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        dot.attr("display", null);
        dot2.attr("display", null);

      }
    
      function left() {
        path.style("mix-blend-mode", "multiply")
        .attr("stroke", d => d.currency === "United States Dollar"? 'black' : d.currency === props.highlight? 'red' :  "steelblue")
        dot.attr("display", "none");
        dot2.attr("display", "none");
  
      }
    }

    const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .enter()
    .append('path')
      .attr("stroke", d => d.currency === "United States Dollar"? 'black' : d.currency === props.highlight? 'red' :  "steelblue")
      .style("mix-blend-mode", "multiply")
      .attr("d", d => line(d.values))
      .attr("opacity", d => d.currency === props.highlight? 1 : d.students/2)
      .attr("stroke-width", d => d.currency === props.highlight? 3 : d.students/10);
      

    svg.call(hover, path); 



  }
  
}

module.exports = d3LineChart;
