//by Li Yanghao

var w = 100;
var h = 115;
var dataset = []
var property = ["Female",  "Local", "USA", "South America", "Europe", "ME Africa", "Asia",
      "Direct Reserve", "Agency", "Air Crews", "Businessmen", "Tourists", "<20 years", 
     "20-35 years", "45-55 years", ">55 years", "Price", "Length of stay", "Occupancy", "Conventions"];
var _property = ["female", "local", "USA", "SA",  "EU",  "MEA", "ASIA",    "DR",
                "agency",  "AC" , "businessmen", "tourists","u20", "20to35",  "35to55",  "m55" ,"price", "LoS", "occupancy", "conventions"];
var category = [0,1,1,1,1,1,1,2,2,2,9,9,4,4,4,4,5,6,7,8];

var category_color = ["#1f77b4", "#ff7f0e","#2ca02c","#d62728","#9467bd",
          "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
var selected_set = [];
var MonthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.",
                    "Nov.", "Dec."];

d3.csv("data/hotel.csv", function(_dataset) {	
	for (var i = 0; i < property.length; ++i){
    dataset[property[i]] = [];
		_dataset.forEach( function(d){
        dataset[property[i]].push(+d[_property[i]]);
    });
		DrawHistogram(w, h, property[i], dataset[property[i]]);
	}

});	

grouphist();

function get_category( prop ) {
  console.log(category[ property.indexOf(prop) ]);
  return category[ property.indexOf(prop) ];
}

//draw a small histogram
function DrawHistogram(w, h, prop, dataset){
  var barPadding = 1;
  var topPadding = 10;
  var bottomPadding = 15;
	var scale = d3.scale.linear()
		.domain([0, d3.max(dataset)])
		.range([0, h-topPadding-bottomPadding])

	var svg = d3.select("#histograms")
		.append("svg")
		.attr("width", w)
    	.attr("height", h)
      .attr("id", prop)
      .attr("fill", category_color[get_category(prop)])
    	.classed({"selected": false, "histogram": true})

	svg.selectAll("rect")
   		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return i * (w / dataset.length);
		})
		.attr("y", function(d) {
		   	return h -bottomPadding- scale(d);
		})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function(d) {
		   	return scale(d);
		});

	svg.append("text")
    	.text(prop)
    	//.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "red")
		.attr('x', w/2)
		.attr('y', h-3)
    .attr('text-anchor','middle');

	svg.on("click", function() {
		var self = d3.select(this);
		self.classed({"selected": !self.classed("selected")});
    if (self.classed("selected"))
      selected_set.push(self.attr("id"));
    else {
      console.log( selected_set );
      selected_set.splice(selected_set.indexOf(self.attr("id")), 1);
      console.log( selected_set );
    }
	});
	
}

function get_selected(){
  var data = [];
  console.log( selected_set );
  for (var i =0;i < selected_set.length;++i){
    data.push( {value: dataset[selected_set[i]], property:selected_set[i]} );
  }
  return data;
}

function remove_selected(){
  d3.selectAll(".histogram")
    .each( function() {
      d3.select(this)
        .classed("selected", false);
    })
  selected_set = [];
}

//show several histograms together
function grouphist(){
  data = get_selected();
  remove_selected();
 // if (data.length == 0)
 //   return;
  d3.select("#grouphist").remove();

  var margin = {top: 20, right: 50, bottom: 30, left: 25},
      width = 1200 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
 // console.log(data[0].value);
  var maxh = 0;
  var cidx = -1;
  for (var i = 0;i < data.length;++i){
      if (data[i].property === "Conventions") cidx = i;
      data[i].scale_val = [];
      data[i].val = []
      for (var j = 0;j < data[i].value.length;++j){
        var sv = (data[i].property === "Length of stay") ? data[i].value[j]*10 : data[i].value[j];
        data[i].scale_val.push( sv );//*height/maxv ) ;
        data[i].val.push( [data[i].value[j], sv]);//*height/maxv] );
      }
      maxh = d3.max([maxh, d3.max(data[i].scale_val)]);
            console.log(data[i].scale_val);
  }
  console.log(cidx);
  if (cidx >= 0){
    data[cidx].scale_val = data[cidx].scale_val.map( function(d) {return d*maxh*0.1;});
    console.log(data[cidx].scale_val);
  }
  for (var i = 0;i < data.length;++i){
    data[i].val = [];
    for (var j = 0;j < data[i].value.length;++j)
      data[i].val.push( [data[i].value[j], data[i].scale_val[j]] );
  }

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
  var x1 = d3.scale.ordinal();
  var y = d3.scale.linear()
      .range([height, 0]);


  var color = d3.scale.category20c();

  var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(0);

  var svg = d3.select("#top-row").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "grouphist")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var month = [];
  for (var i =0;i < 12;++i)
    month.push(i);

  x0.domain(data.map(function(d) { return d.property; }));
  x1.domain(month).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, maxh]);


  var xh = height+8;
  var gtmp = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + xh + ")")
    .call(xAxis);
  gtmp.selectAll("g.tick")
        .data(data)
        .attr("fill", function(d) {return category_color[get_category(d.property)]; })
        .attr("font-weight", "bolder");

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  
  var state = svg.selectAll(".property")
    .data(data)
    .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { return "translate(" + x0(d.property) + ",0)"; });

  state.selectAll("rect")
    .data(function(d) { return d.scale_val; })
    .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d,i) { return x1(i); })
        .attr("y", function(d) { return y(d); })
        .attr("height", function(d) { return height - y(d); })
        .style("fill", function(d,i) { return color(i); });

  state.selectAll("text")
    .data(function(d) {return d.val; })
    .enter().append("text")
      .text(function(d) {
     //   console.log(d[0], d[1]);
        return d[0];
      })
      .attr("x", function(d,i) {return x1(i)+x1.rangeBand()/2-6; })
      .attr("y", function(d) {return y(d[1])-2})
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", "black");

    var legend = svg.selectAll(".legend")
        .data(MonthNames)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width + 23)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d,i) { return color(i);} );

    legend.append("text")
        .attr("x", width + 22)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });


}
