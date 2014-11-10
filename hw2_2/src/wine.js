var PC = {};
    PC.margin = {top: 30, right: 10, bottom: 10, left: 5};
    PC.width = 800 - PC.margin.left - PC.margin.right;
    PC.height = 400 - PC.margin.top - PC.margin.bottom;

    PC.x = d3.scale.ordinal().rangePoints([0, PC.width], 1);
    PC.y = {};
    PC.dragging = {};
    PC.line = d3.svg.line();
    PC.axis = d3.svg.axis().orient("left");
    PC.background = {};
    PC.foreground = {};

var HG = {};
    HG.margin = {top:30, right: 10, bottom: 30, left: 200};
    HG.width = 400 - HG.margin.left - HG.margin.right;
    HG.height = 200 - HG.margin.top - HG.margin.bottom;

var PIE = {};
var LEG = {};

var color = d3.scale.category10();
var dimensions;
var stat = {};
var num = [0, 59, 71, 48];
var attrName = ["Alcohol","Malic acid","Ash","Alcalinity of ash","Magnesium","Total phenols","Flavanoids",
  "Nonflavanoid phenols","Proanthocyanins","Color intensity","Hue","OD280/OD315 of diluted wines","Proline"];
var wine;

d3.csv("data/wine.csv", function(error, _wine) {
  wine = _wine;
  ParallelCoord( wine );
  Calcu_stat( wine );
  console.log( stat );
  ShowHistogram( stat["A1"], "A1" );
  DrawPie();
});

//get some statistic data
function Calcu_stat( wine ){
  for (var j = 0;j < dimensions.length;++j) {
    p = dimensions[j];
    if (p != "Wine"){
      stat[p] = [];
      for (var i = 1;i <=3; ++i){
        var r = {};
        r.No = i;
        r.mean = wine.reduce( function(sum, d) {
                                        if (d["Wine"] === i.toString()) {return sum+(+d[p]); }
                                        else { return sum; } }, 0) / num[i];
        r.deviation = Math.sqrt(wine.reduce( function(diff, d) {
                                        if (d["Wine"] === i.toString()) {k = (+d[p])-r.mean;return diff+(k*k); }
                                        else { return diff; } }, 0) / num[i] );
        stat[p].push( r );
      }
    }
  }
}

//show info in right column
function ShowHistogram( data, propty ){
  //create svg for histogram
      var svg = d3.select("#histgram").append("svg")
          .attr("width", HG.width+HG.margin.left+HG.margin.right)
          .attr("height", HG.height+HG.margin.top+HG.margin.bottom);
      var hGsvg = svg.append("g")
          .attr("transform", "translate(" + HG.margin.left + "," + HG.margin.top + ")");

      HG.x = d3.scale.ordinal().rangeRoundBands([0, HG.width], 0.2)
                .domain( data.map(function(d) {return d.No;}) );
      HG.y = d3.scale.linear().range([HG.height, 0])
                .domain([d3.min(data, function(d) {return d.mean-d.deviation})*0.95, d3.max(data, function(d) {return d.mean+d.deviation})]);

      var xAxis = d3.svg.axis()
                    .scale( HG.x )
                    .orient("bottom");
      var yAxis = d3.svg.axis()
                    .scale( HG.y )
                    .orient("left")
                    .ticks(8);
                    
      var gtmp = hGsvg.append("g")
              .attr("class", "x hG axis")
              .attr("transform", "translate(0," + HG.height +")")
              .call(xAxis);
     

      hGsvg.append("g")
              .attr("class", "y hG axis")
              .call(yAxis);

      var bars = hGsvg.selectAll(".bar")
            .data( data )
          .enter().append("g")
            .attr("class", "hG bar");

      bars.append("rect")
          .attr("x", function(d) { return HG.x(d.No);} )
          .attr("y", function(d) { console.log(HG.y(d.mean+d.deviation)); return HG.y(d.mean+d.deviation);} )
          .attr("width", HG.x.rangeBand())
          .attr("height", function(d) {console.log(HG.y(d.mean-d.deviation)-HG.y(d.mean+d.deviation));  return HG.y(d.mean-d.deviation)-HG.y(d.mean+d.deviation);}) 
          .attr("fill", function(d) { return color(d.No);});

      hGsvg.append("g")
            .attr("class", "hG title")
            .append("text")
            .attr("x", HG.width/2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(propty+":"+getName(propty));
      HG.update = function(propty){
          var data = stat[propty];

          HG.y.domain([d3.min(data, function(d) {return d.mean-d.deviation})*0.95, d3.max(data, function(d) {return d.mean+d.deviation})]);

          bars.data( data ).select("rect").transition().duration(500)
              .attr("y", function(d) { console.log(HG.y(d.mean+d.deviation)); return HG.y(d.mean+d.deviation);} )
              .attr("height", function(d) {console.log(HG.y(d.mean-d.deviation)-HG.y(d.mean+d.deviation));  return HG.y(d.mean-d.deviation)-HG.y(d.mean+d.deviation);}) 

          hGsvg.select(".hG.title").select("text").text(propty+":"+getName(propty));

          hGsvg.select(".y.hG.axis").call(yAxis);
         
      }

      data = get_pie_data();
      var legend = svg.append("g")
            .attr("transform", "translate(" + 0 + "," + HG.margin.top + ")")
            .selectAll(".legend")
            .data(data.pie2)
          .enter().append("g")
            .attr("class", "hG legend")
            .attr("transform", function(d,i) { return "translate(15," + (i+1) * 32 + ")"; });

      legend.append("rect")
            .attr("x", 40)
            .attr("width", 30)
            .attr("height", 25)
            .style("fill", function(d) {return color(d.type)});

      legend.append("text")
            .attr("x", 5).attr("y", 15).attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) {return "Wine"+d.type;});

      
      legend.append("text").attr("class", "prct")
            .attr("x", 97).attr("y", 15).attr("dy", ".35em")
            .style("text-anchor", "end")
            .text( function(d,i) {return d3.format("%")(d.num/num[i+1])});


      LEG.update = function() {
        data = get_pie_data();
        var l = legend.data( data.pie2 );
        l.select(".prct").text(function(d,i) {return d3.format("%")(d.num/num[i+1])});
      }

}

function getName( propty ){
  return attrName[Number(propty.substring(1))-1];
}

function get_pie_data(){
  var data = {pie1: [], pie2: []};
  data.pie1 = [ {type: "select", num: 0}, {type: "unselect", num:0} ];
  for (var i = 1;i <= 3;++i){
    data.pie2.push( {type:i, num: 0} );
  }
  for (var i = 0;i < PC.foreground[0].length;++i){
    if (d3.select(PC.foreground[0][i]).style("display") === "none"){
      data.pie1[1].num++;
    }else {
      data.pie1[0].num++;
      data.pie2[ (+wine[i]["Wine"])-1].num++;
    }
  }
  return data;
}

//draw Pie Chart
function DrawPie( ){
  data = get_pie_data();
  var width = 400, 
      height = 300,
      radius = 60;
  var p1margin = {cx: (10+radius),  cy: radius};
  var p2margin = {cx: (4*radius),   cy: radius};
  var color2 = d3.scale.ordinal().range(["#969696", "#d9d9d9"]);

  var svg = d3.select("#piechart").append("svg")
              .attr("width", width)
              .attr("height", height).append("g")
              .attr("transform", "translate("+30+','+0+")");
  var psvg1 = svg.append("g")
                .attr("transform", "translate(" + p1margin.cx + "," + p1margin.cy + ")");

  var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

  var pie = d3.layout.pie().sort(null).value(function(d) { return d.num });

 

  var psvg2 = svg.append("g")
                .attr("transform", "translate(" + p2margin.cx + "," + p2margin.cy + ")");
 

  PIE.update = function() {
    data = get_pie_data();
    var slice = psvg1.selectAll(".slice").data(pie(data.pie1)).enter().insert("path")
      .attr("d", arc)
      .style("fill", function(d) { return color2(d.data.type); });
    slice.transition().duration(1000)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
      };
    })

    slice = psvg2.selectAll(".slice2").data(pie(data.pie2)).enter().insert("path")
      .attr("d", arc)
      .style("fill", function(d,i ) { return color(d.data.type); });
    slice.transition().duration(1000)
      .attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
      };
    })
  }

  PIE.update();
  psvg1.append("g").attr("class", "pie title")
        .append("text")
        .attr("x", 0)
        .attr("y", p1margin.cy+3)
        .attr("text-anchor", "middle")
        .text("Total");
  psvg2.append("g").attr("class", "pie title")
        .append("text")
        .attr("x", 0)
        .attr("y", p2margin.cy+3)
        .attr("text-anchor", "middle")
        .text("Wine");


}

//draw ParallelCoordinates
function ParallelCoord( wine ){
  var svg = d3.select("#left-column").append("svg")
      .attr("width", PC.width + PC.margin.left + PC.margin.right)
      .attr("height", PC.height + PC.margin.top + PC.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + PC.margin.left + "," + PC.margin.top + ")");

  // Extract the list of dimensions and create a scale for each.
  PC.x.domain(dimensions = d3.keys(wine[0]).filter(function(d) {
    return d != "Wine" && (PC.y[d] = d3.scale.linear()
        .domain(d3.extent(wine, function(p) { return +p[d]; }))
        .range([PC.height, 0]));
  }));

  // Add grey background lines for context.
  PC.background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(wine)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  PC.foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(wine)
    .enter().append("path")
      .attr("d", path)
      .attr("stroke", pathcolor);

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + PC.x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: PC.x(d)}; })
        .on("dragstart", function(d) {
          PC.dragging[d] = PC.x(d);
          PC.background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          PC.dragging[d] = Math.min(PC.width, Math.max(0, d3.event.x));
          PC.foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          PC.x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete PC.dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + PC.x(d) + ")");
          transition(PC.foreground).attr("d", path);
          PC.background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));
  g.on("mouseover", function(d,i) {
      HG.update(d);
  });

  // Add an axis and title.
  g.append("g")
      .attr("class", "PC axis")
      .each(function(d) { d3.select(this).call(PC.axis.scale(PC.y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });


  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(PC.y[d].brush = d3.svg.brush().y(PC.y[d]).on("brushstart", brushstart).on("brush", brush));
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
}

function position(d) {
  var v = PC.dragging[d];
  return v == null ? PC.x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return PC.line(dimensions.map(function(p) { return [position(p), PC.y[p](d[p])]; }));
}

//Returns the color for different wines
function pathcolor(d) {
  return color(d["Wine"]);
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !PC.y[p].brush.empty(); }),
      extents = actives.map(function(p) { return PC.y[p].brush.extent(); });
  PC.foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
  PIE.update();
  LEG.update();
}