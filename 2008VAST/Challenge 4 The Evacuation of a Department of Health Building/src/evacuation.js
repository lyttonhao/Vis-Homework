var L = 7, R = L*0.35, bombR = 10;
var map = new Object();
map.margin = {top: 3, right: 3, bottom: 3, left: 8};
map.width = 91*L; map.height = map.width/91*61;
map.W = 91; map.H = 61;

var Sp = new Object(), Lc = new Object();
var mapscale = d3.scale.linear().range([0, map.width]).domain([0, 91]);
var mapsvg = d3.select( '#mapspace' ).append('svg')
              .attr('width', map.width+map.margin.left+map.margin.right)
              .attr('height', map.height+map.margin.top+map.margin.bottom)
              .append('g').attr("transform", "translate(" + map.margin.left + "," + map.margin.top + ")");
var person = new Array();
var np = 82;
var start = 0, now = 0, endtime = 837;    //start time is Time 0.
var stop = true, delaytime = 150;
var line = d3.svg.line()
      .x(function(d) {return mapscale(d.x)+L/2; })
      .y(function(d) {return mapscale(d.y)+L/2; })
var bomb = {x: -1, y: -1};
var timeline;
var colors = d3.scale.category10();

d3.text('data/proced_building.txt', function(builddata) {
  d3.csv('data/proced_name.csv', function(persondata) {
    d3.csv('data/proced_pathway.csv', function(pathdata) {
      drawmap( builddata );
      person = persondata;
      drawperson( pathdata );
      drawTable( 'id' );
      drawScatterplot( );
      drawLineChart( );
    });
  });
});

$( "#slider-range" ).slider({
    range: true,
    min: 1,
    max: 837,
    values: [ 1, 1 ],
    slide: function( event, ui ) {
    //  console.log( ui.values[0], ui.values[1])
      start = ui.values[0]-1; now = ui.values[1]-1;
      d3.selectAll("circle.person")
        .transition().ease("linear").duration(delaytime)
        .attr('cx', function(d) {return mapscale(d.path[now].x)+L/2; })
        .attr('cy', function(d) {return mapscale(d.path[now].y)+L/2; });
      update();

    }
});
$( "#nowtime" ).val(  $( "#slider-range" ).slider( "values", 0 ) +
    " /" + $( "#slider-range" ).slider( "values", 1 ) );

//draw the map the buliding
function drawmap( buildmap ){
  var mapdata = new Array();
  for (var i = 0, idx = 0;i < map.H;++i)
    for (var j = 0;j < map.W;++j, ++idx)
      mapdata[idx] = {val: buildmap[idx], x: j, y: i};

  mapsvg.append('g').selectAll('rect').data( mapdata ).enter().append('rect')
        .attr('class', 'map')
        .attr('id', function(d) {return 'map'+d.x+d.y; })
        .attr('x', function(d) {return mapscale(d.x); })
        .attr('y', function(d) {return mapscale(d.y); })
        .attr('width', L).attr('height', L)
        .classed('block', function(d) { return d.val == '1' ? true : false;})
        .on('click', function(d) {
          d3.select('rect#map'+bomb.x+bomb.y).classed("bomb", false);
          if (d.x === bomb.x && d.y === bomb.y) {
            bomb = {x: -1, y:-1};
            d3.select('circle.bombcircle').classed('nodisplay', true);
          }
          else {
            bomb = {x:d.x, y:d.y};
            d3.select('rect#map'+bomb.x+bomb.y).classed("bomb", true);
            d3.select('circle.bombcircle')
              .attr('cx', mapscale(bomb.x)+L/2)
              .attr('cy', mapscale(bomb.y)+L/2)
              .classed('nodisplay', false);
          }
          d3.select("#bombxy").text("Bomb: ("+(bomb.x*10)+', '+(bomb.y*10)+') R: ' + bombR*L);
          update_bombdis();
        });

  mapsvg.append('path')
        .attr('id', 'overpath').attr('class', 'overpathline nodisplay');
  mapsvg.append('circle')
        .attr('class', 'bombcircle').attr('r', bombR*L)
        .classed('nodisplay', true);
}

//draw person dot and collect some person data
function drawperson( data ) {
  for (var i = 0;i < np;++i) {
    person[i].path = new Array();
    person[i].speed = new Array();
    person[i].speed1 = new Array();
    person[i].distance = -1;
    person[i].id = +person[i].id
    person[i].selected = false;
  }

  for (var i = 0;i < data.length;++i) {
    var t = (+data[i].Time)-1, p = +data[i].Person;
    person[p].path[t] = {x: (+data[i].xcor), y: 60-(+data[i].ycor) };
  }
  for (var i = 0;i < 82;++i) {
    person[i].speed[0] = dis(person[i].path[1], person[i].path[0]);
    person[i].speed[836] = dis(person[i].path[836], person[i].path[835]);
    for (var j = 1;j < 836;++j){
      person[i].speed[j] = dis(person[i].path[j+1], person[i].path[j-1])/2;
      person[i].speed1[Math.round(j/3)] = person[i].speed[j];
    }
    for (var j = 3;j < 837;++j)
      person[i].speed[j] = Math.round(100*(person[i].speed[j-2]+person[i].speed[j-1]+person[i].speed[j])/3)/100;
  }
  
  mapsvg.append('g').selectAll('circle').data( person ).enter().append('circle')
        .attr('class', 'person').attr('r', R)
        .attr('cx', function(d) {return mapscale(d.path[now].x)+L/2; })
        .attr('cy', function(d) {return mapscale(d.path[now].y)+L/2; })
        .attr('id', function(d) {return 'p'+d.id; })
        .on("mouseover", function(d) { func_mouseover(d); })
        .on("mouseout", function(d) { func_mouseout(d); })
        .on("click", function(d) { 
            if (person[d.id].selected) {
              person[d.id].selected = false;
              unselected(d); 
            }else {
              person[d.id].selected = true;
              selected(d);
            }
        });

  mapsvg.append('g').selectAll('path').data( person ).enter().append('path')
        .attr('id', function (d) {return 'pathline'+d.id; }).attr('class', 'pathline nodisplay');
}

function dis( a, b) {
    return Math.round(100*Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2)))/10;
}

function selected(d) {
  console.log( "select" +d.id);
  d3.select('circle#p'+d.id).style("fill",colors(d.id));//.classed("selected", true);
  d3.select('tr#p'+d.id).style("background-color", colors(d.id));//.classed("trselected", true);
  d3.select('path#pathline'+d.id).classed("nodisplay", false).style("stroke", colors(d.id))
      .datum(person[d.id].path.slice(0, now+1)).attr('d', line);
  d3.select('circle#d'+d.id).style("fill", colors(d.id));//.classed("selected", true);
  d3.select('path#l'+d.id).classed("selected", true).style("stroke", colors(d.id));
}

function unselected(d) {
  d3.select('circle#p'+d.id).style("fill", null);//.classed("selected", false);
  d3.select('tr#p'+d.id).style("background-color", null);
  d3.select('path#pathline'+d.id).classed("nodisplay", true);
  d3.select('circle#d'+d.id).style("fill",null);
  d3.select('path#l'+d.id).classed("selected", false).style("stroke", null);
}
//mouse move over
function func_mouseover(d) {
  //  console.log(now);
  d3.select("#info").classed("nodisplay", false)
      .style("left", mapscale(d.path[now].x)+L+map.margin.left+250+"px")
      .style("top", mapscale(d.path[now].y)+L+map.margin.top+30+"px")
      .text( d.id + ' ' + person[d.id].name );
  d3.select('path#overpath').classed("nodisplay", false)
      .datum(person[d.id].path.slice(0, now+1)).attr('d', line);
  d3.select('circle#p'+d.id).classed("over", true);
  d3.select('tr#p'+d.id).classed("trover", true);
  d3.select('circle#d'+d.id).classed("over", true);
  d3.select('path#l'+d.id).classed("over", true);
}
//mouse move out
function func_mouseout(d) {
  d3.select("#info").classed("nodisplay", true);
  d3.select('path#overpath').classed("nodisplay", true);
  d3.select('circle#p'+d.id).classed("over", false);
  d3.select('tr#p'+d.id).classed("trover", false);
  d3.select('circle#d'+d.id).classed("over", false);
  d3.select('path#l'+d.id).classed("over", false);
}

//show path of person
function showpath(d) {
  d3.select('path#pathline'+d.id)
      .datum(person[d.id].path.slice(0, now+1)).attr('d', line);
}

function bombdis(p) {
  if (bomb.x == -1) return -1;
  return dis(bomb, p);
}

function update_bombdis() {
  update_table();
  update_scatter();
}

function update_table() {
  for (var i = 0;i < 82;++i){
    person[i].distance = bombdis( person[i].path[now] );
  }
  for (var i = 0;i < 82;++i){
    d3.select("tr#p"+i).selectAll("td")
          .data(tableDataToArray(person[i]))
          .text(function(d) { return d; });
  } 
}

function update_scatter() {
  Sp.x.domain(d3.extent(person, function(d) { return d.speed[now]; })).nice();
  Sp.y.domain(d3.extent(person, function(d) { return d.distance; })).nice();
  d3.selectAll("circle.dot").data(person)
      .transition().duration(delaytime)
      .attr("cx", function(d) { return Sp.x(d.speed[now]); })
      .attr("cy", function(d) { return Sp.y(d.distance); })
}
var domtimeline;
function update() {
  $( "#nowtime" ).val(  (start+1) + " / " + (now+1) );
  $('#slider-range').slider( {values: [start+1, now+1]});  
  domtimeline.attr({'x1': Lc.x(now+1), 'x2': Lc.x(now+1)});
  update_table();
  for (var i = 0;i < 82;++i){
    if (person[i].selected === true) showpath(person[i]);
  }
  update_scatter();
}

function play(d) {
  console.log(d);
  if (d.value === "Play") {
    d.value = "Stop";
    Inter = setInterval( movestep, delaytime );
  }else if (d.value === "Stop") {
    d.value = "Play";
    clearInterval( Inter );
  }else {
    start = 0; now = 0;
    d.value = "Play";
    update();
    d3.selectAll("circle.person")
      .attr('cx', function(d) {return mapscale(d.path[now].x)+L/2; })
      .attr('cy', function(d) {return mapscale(d.path[now].y)+L/2; });
  }
  
  function movestep() {
  //  console.log(now);
    if (++now >= endtime) {
      clearInterval( Inter );
      d.value = "Reset";
      --now;
      return ;
    }
   // console.log(now);
  //  d3.select("#nowtime").text( 'Time:' + (now+1) +'/837');
    update();
    d3.selectAll("circle.person")
      .transition().ease("linear").duration(delaytime)
      .attr('cx', function(d) {return mapscale(d.path[now].x)+L/2; })
      .attr('cy', function(d) {return mapscale(d.path[now].y)+L/2; });
  }
}

function func_speed( d ) {
  d3.select("#speedx1").classed("buttonpressed", false);
  d3.select("#speedx2").classed("buttonpressed", false);
  d3.select("#speedx5").classed("buttonpressed", false);
  d3.select("#speed"+d.value).classed("buttonpressed", true);
  delaytime = 150/(+d.value[1]);
 // play(d3.select('#playbutton'));
 // console.log(delay);
}

//draw  Table
function drawTable( attrName ) {
  console.log( attrName );
  d3.select("tbody").selectAll("tr").remove();

  // Header
  var th = d3.select("thead").selectAll("th")
            .data(['id', 'name', 'speed', 'distance'])
          .enter().append("th")
            .attr("onclick", function (d, i) { return "drawTable('" + d + "');";})
            .text(function(d) { return d; });

// Rows
console.log( person[0][attrName], person[1][attrName]);
  var tr = d3.select("tbody").selectAll("tr")
            .data(person)
          .enter().append("tr")
             .attr('id', function(d) {return 'p'+d.id; })
             .style("background-color", function(d) {return person[d.id].selected ? colors(d.id) : null })
           //  .classed('trselected', function(d) { return person[d.id].selected; } )
             .on("mouseover", function(d) { func_mouseover(d); })
             .on("mouseout", function(d) { func_mouseout(d); })
             .on("click", function(d) { 
                  if (person[d.id].selected) {
                    person[d.id].selected = false;
                    unselected(d); 
                  }else {
                    person[d.id].selected = true;
                    selected(d);
                  }
              })
             .sort(function (a, b) { return a == null || b == null ? 0 : Compare(attrName, a[attrName], b[attrName]) });


// Cells
  var td = tr.selectAll("td")
            .data(function(d) { return tableDataToArray(d); })
          .enter().append("td")
            .attr("align", "center")
            .text(function(d) { return d; });
}

function Compare(attrName, a, b) {
  switch (attrName) {
    case 'id':
      return a > b ? 1 : a == b ? 0 : -1;
    case 'name':
      a = a.toLowerCase();
      b = b.toLowerCase();
      return a > b ? 1 : a == b ? 0 : -1;
    case 'speed':
      return a[now] < b[now] ? 1 : a[now] == b[now] ? 0 : -1;
    case 'distance':
      return a > b ? 1 : a == b ? 0 : -1;
  }
}

function tableDataToArray(d) {
  return [d.id, d.name, d.speed[now], d.distance];
}


function drawScatterplot() {
  var margin = {top: 5, right: 10, bottom: 30, left: 30},
    width = 350 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  Sp.x = d3.scale.linear().range([0, width]);
  Sp.y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(Sp.x).ticks(5).orient("bottom");
  var yAxis = d3.svg.axis().scale(Sp.y).ticks(5).orient("left");

  var svg = d3.select("#speeddis").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  Sp.x.domain([0,3]).nice();
  Sp.y.domain([-1, 900]).nice();

  svg.append("g")
      .attr("class", "x axis").attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label").attr("x", width).attr("y", -6)
      .style("text-anchor", "end")
      .text("Speed");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label").attr("transform", "rotate(-90)")
      .attr("y", 6).attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Distance")

  svg.selectAll(".dot")
      .data(person)
    .enter().append("circle")
      .attr("class", "dot").attr("r", R)
      .attr("id", function(d) { return "d"+d.id; })
      .attr("cx", function(d) { return Sp.x(d.speed[now]); })
      .attr("cy", function(d) { return Sp.y(d.distance); })
      .on("mouseover", function(d) { func_mouseover(d); })
      .on("mouseout", function(d) { func_mouseout(d); })
      .on("click", function(d) { 
            if (person[d.id].selected) {
              person[d.id].selected = false;
              unselected(d); 
            }else {
              person[d.id].selected = true;
              selected(d);
            }
      });
}

function drawLineChart() {
  var margin = {top: 5, right: 30, bottom: 20, left: 30},
    width = 950 - margin.left - margin.right,
    height = 230 - margin.top - margin.bottom;

  Lc.x = d3.scale.linear().range([0, width]);
  Lc.y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(Lc.x).ticks(5).orient("bottom");
  var yAxis = d3.svg.axis().scale(Lc.y).ticks(5).orient("left");

  var svg = d3.select("#speedpic").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  Lc.x.domain([0, 837]).nice();
  Lc.y.domain([0, 6]).nice();
  var line = d3.svg.line()
      .x(function(d,i) {return Lc.x(i*3); })
      .y(function(d) {return Lc.y(d); })

  domtimeline = svg.append('g').append('line').attr("id", "timeline11")
    .attr('x1', Lc.x(now+1)).attr('y1', Lc.y(6))
    .attr('x2', Lc.x(now+1)).attr('y2', Lc.y(0));

  svg.append("g")
      .attr("class", "x axis").attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label").attr("x", width).attr("y", -6)
      .style("text-anchor", "end")
      .text("Time");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label").attr("transform", "rotate(-90)")
      .attr("y", 6).attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Speed")

 // return ;
  svg.selectAll(".speedpath")
      .data(person)
    .enter().append("path")
      .attr("class", "speedpath")
      .attr("id", function(d) { return "l"+d.id; })
      .attr('d', function(d) {return line(d.speed1); })
      .on("mouseover", function(d) { func_mouseover(d); })
      .on("mouseout", function(d) { func_mouseout(d); })
      .on("click", function(d) { 
            if (person[d.id].selected) {
              person[d.id].selected = false;
              unselected(d); 
            }else {
              person[d.id].selected = true;
              selected(d);
            }
      });


}