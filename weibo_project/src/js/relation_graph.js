/*var color_u= d3.scale.category20();
var color_k = d3.scale.category10();
var dataset1 = {
  nodes:[
    {"name": "k0"},
    {"name": "u0"},
    {"name": "u1"},
    {"name": "k1"},
    {"name": "u2"}
  ],
  edges:[
  {"source":0, "target":1, "weight":3},
  { "source":0, "target":2, "weight":4},
  {"source":3, "target":1, "weight":7},
  {"source":3, "target":4, "weight":8}
  ]
};*/
// var edge_weight_scale; //测试使用
// var user_weight_scale;
function force_graph(place,fg_w, fg_h, fg_padding, dataset)
{
  //标签
if(dataset.nodes.length != 0)
{
	var tip = d3.tip()
              .attr('class', function(d){
                  return "d3-tip-graph";
              })
              .offset([-10, 0])
              .html(function(d) {
                return "<strong></strong> <span style='color:white'>" + keywords[+(d["name"].substring(1, d["name"].length))]["word"] + "</span>";
              });

  var user_tip = d3.tip()
                   .attr("class", function(d){
                       return "d3-tip-graph-user";
                   })
                   .offset([-10, 0])
                   .html(function(d){
                      var index = d["name"].substring(1);
                         index = (+index);
                      var user_keywords ="";
                      var keyword_array = keywordlist_by_user(index);
                      keyword_array.forEach(function(d_k, i_k){
                          user_keywords = user_keywords + " " +keywords[+d_k]["word"];
                      });
                        return "<strong></strong> <span style='color:white'>" + index + ":"+ user_keywords + "</span>";
                   });
  //边的权重映射函数
    var  edge_weight_scale = d3.scale.linear()
                            .domain(d3.extent(dataset.edges, function(d, i){
                               return d["weight1"];
                            }))
                            .range([1, 5]);
  //user权重的映射
  //首先获取所有的user的index
  var user_index_array = [];
  dataset.nodes.forEach(function(d, i){
     if(d["name"][0] == "u")
     {
        user_index_array.push(i);
     }
  })
    var user_weight_scale = d3.scale.linear()
                              .domain(d3.extent(user_index_array, function(d, i){
                                return dataset.nodes[d]["weight1"];
                              }))
                             .range([3,8]);
  //keyword权重映射
  var keyword_index_array = [];
  dataset.nodes.forEach(function(d, i){
    if(d["name"][0] == "k")
    {
       keyword_index_array.push(i);
    }
  });
   var keyword_weight_scale = d3.scale.linear()
                               .domain(d3.extent(keyword_index_array, function(d, i){
                                   return dataset.nodes[d]["weight1"];
                               }))
                               .range([20,25]);

	 var svg = place.append("svg")
              .attr("id", "related_graph")
	            .attr("width", fg_w + 2 * fg_padding)
	            .attr("height", fg_h + 2 * fg_padding);
	var force = d3.layout.force()
	                    .nodes(dataset.nodes)
	                    .links(dataset.edges)
	                    .size([fg_w, fg_h])
	                    .linkDistance(80)
	                    .charge(-80)
	                    .start();
	 var edges = svg.selectAll("line")
	                .data(dataset.edges)
	                .enter()
	                .append("line")
	                .style("stroke", "rgb(122, 131, 142)")
	                .style("stroke-width", function(d, i){
                     return edge_weight_scale(d["weight1"]);
                  });
	var nodes_g = svg.selectAll("g")
	                 .data(dataset.nodes)
	                 .enter()
	                 .append("g")
	                 .attr("class", function(d, i)
	                 {
	                 	 return d["name"][0];
	                 })
	                 .call(force.drag);
	 var nodes_u = d3.selectAll(".u")
                     .append("circle")
                     .attr("r", function(d, i){
                         var index = d["name"].substring(1);
                         index= (+index);
                         var size=  user_weight_scale(d["weight1"]);
                         if(size == NaN || size > 8)
                         {
                            size = 8;
                         }
                         return size;
                     })
                     .attr("cx", 0)
                     .attr("cy", 0)
                     .attr("class", function(d, i){
                     	 return d["name"];
                     })
                     .attr("fill", function(d, i){
                    	 var index = d["name"].substring(1, d["name"].length);
                       index = (+index);
                      /* var size = user_weight_scale(users[index]["keyword"].length);
                       if(size == undefined)
                          {
                             size = 10;
                          }
                          size = d3.round(size);*/
                       return color_u(index);
                     })
                     .call(user_tip)
                     .on("mouseover", user_tip.show)
                     .on("mouseout", user_tip.hide);
      var nodes_k = d3.selectAll(".k")
                      .append("rect")
                      .attr("x", function(d, i){
                         var size = keyword_weight_scale(+(d["weight1"]));
                        if(size == NaN || size > 25)
                        {
                           size = 25;
                        }
                        return -size/2;
                      })
                      .attr("y", function(d, i){
                         var size = keyword_weight_scale(+(d["weight1"]));
                        if(size == NaN || size > 25)
                        {
                           size = 25;
                        }
                        return -size/2;
                      })
                      .attr("width", function(d, i){
                        var size = keyword_weight_scale(+(d["weight1"]));
                        if(size == NaN || size > 25)
                        {
                           size = 25;
                        }
                        return size;
                      })
                      .attr("height", function(d, i){
                        var size = keyword_weight_scale(+(d["weight1"]));
                        if(size == NaN || size > 25)
                        {
                           size = 25;
                        }
                        return size;
                      })
                      .attr("class", function(d, i){
                      	  return d["name"];
                      })
                      .attr("rx", "5px")
                      .attr("ry", "5px")
                      .attr("fill", function(d, i){
                      	var index = d["name"].substring(1);
                           return color_k(+index);
                      })
                    .call(tip)
                      .on("mouseover",tip.show)
                      .on("mouseout", tip.hide);
  
	force.on("tick", function() {
     edges.attr("x1", function(d) { return d.source.x; })
           .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      nodes_g.attr("transform", function(d, i){
      	  return "translate(" + d.x + "," + d.y + ")";
      })
  });
}
}



