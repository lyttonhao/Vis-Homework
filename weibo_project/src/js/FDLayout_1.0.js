var nl_temperature;
var nl_graph_time;
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
};

function nl_graph_new(dataset, nl_w, nl_h)
{
	var dataset_keys = Object.keys(dataset);   //获取dataest的属性。第一个属性是点，第二个属性是边
	var node_name = dataset_keys[0];
	var edge_name = dataset_keys[1];
	var delt_x, delt_y, distance;
	//判断是否需要对所有的点进行初始化
	if(dataset[node_name]["position"] == undefined)
	{
       dataset[node_name].forEach(function(d, i){
       	    d["position"] = {};
       	    d["position"]["x"] = Math.min(Math.random() * nl_w, nl_w);
       	    d["position"]["y"] = Math.min(Math.random() * nl_h, nl_h);
       	    d["previous"] = {};
       	    d["previous"]["x"] = 0;
       	    d["previous"]["y"] = 0;
       	    d["disp"] = {};
       	    d["index"] = i;
       });
       nl_temperature = 0;
       nl_graph_time = 0;
	}
	//将所有点的偏移量设置为0
    dataset[node_name].forEach(function(d, i){
    	 d["disp"]["x"] = 0;
    	 d["disp"]["y"] = 0;
    	 d["previous"]["x"] = d["position"]["x"];
    	 d["previous"]["y"] = d["position"]["y"];
    })

    //参数的设置
    nl_graph_time ++;
    var lengthScaleFactor = 0.6;
    var vertixs_len = dataset[node_name].length;
    var edges_len = dataset[node_name].length;
    var k = Math.sqrt(nl_w * nl_h * 1.0 / vertixs_len) * lengthScaleFactor;
    if( k > 150)
    {
    	k = 150;
    }
    if(nl_temperature == 0)
    {
    	nl_temperature = k;
    }
    var idealLength = k;
    if(idealLength > 100)
    {
      idealLength = 100;
    }
    //计算斥力
    for( var i =0; i< vertixs_len; i++)
    {
    	for(var j = i +1; j < vertixs_len; j++)
    	{
    		 delt_x = dataset[node_name][i]["position"]["x"] - dataset[node_name][j]["position"]["x"];
    		 delt_y = dataset[node_name][i]["position"]["y"] - dataset[node_name][j]["position"]["y"];
    		 distance = Math.sqrt(delt_x * delt_x + delt_y * delt_y);
    		if( distance > 2 * idealLength)
    		{
    			continue;
    		}
    		if(distance < 0.1)
    		{
    			distance = 0.1;
    			if(delt_x < 0.1)
    			{
    				delt_x = 0.1;
    			}
    			if(delt_y < 0.1)
    			{
    				delt_y = 0.1;
    			}
    		}
    		var force_re = fr(idealLength, distance, 1.0);
    		dataset[node_name][i]["disp"]["x"] += delt_x / distance * force_re;
    		dataset[node_name][i]["disp"]["y"] += delt_y / distance * force_re;
    		dataset[node_name][j]["disp"]["x"] -= delt_x / distance * force_re;
    		dataset[node_name][j]["disp"]["y"] -= delt_y / distance * force_re;
    	}
    }

    //计算引力
    dataset[edge_name].forEach(function(d, i){
    	var vertix1 = d["source"];
    	   vertix1 = (+vertix1);
    	var vertix2 = d["target"];
    	    vertix2 = (+vertix2);
    	   delt_x = dataset[node_name][vertix1]["position"]["x"] - dataset[node_name][vertix2]["position"]["x"];
    	   delt_y = dataset[node_name][vertix1]["position"]["y"] - dataset[node_name][vertix2]["position"]["y"];
    	   distance = Math.sqrt(delt_x * delt_x + delt_y * delt_y);
    	   if(distance < 0.1)
    		{
    			distance = 0.1;
    			if(delt_x < 0.1)
    			{
    				delt_x = 0.1;
    			}
    			if(delt_y < 0.1)
    			{
    				delt_y = 0.1;
    			}
    		}
        var force_attr = fa(idealLength, distance, 1.0);
            dataset[node_name][vertix1]["disp"]["x"] -= delt_x / distance * force_attr;
    		dataset[node_name][vertix1]["disp"]["y"] -= delt_y / distance * force_attr;
    		dataset[node_name][vertix2]["disp"]["x"] += delt_x / distance * force_attr;
    		dataset[node_name][vertix2]["disp"]["y"] += delt_y / distance * force_attr;
    });
    
    var dis_sum = 0;
    for(var i = 0; i< vertixs_len; i++)
    {
    	var disp_x = dataset[node_name][i]["disp"]["x"];
    	var disp_y = dataset[node_name][i]["disp"]["y"];
    	disp_distance = Math.sqrt(disp_x * disp_x + disp_y * disp_y);
    	if(disp_distance < 2)
    	{
          	disp_distance = 2;
    	}
    	dataset[node_name][i]["position"]["x"] += disp_x / disp_distance * Math.min(disp_distance, nl_temperature);
    	dataset[node_name][i]["position"]["y"] += disp_x / disp_distance * Math.min(disp_distance, nl_temperature);
    	dis_sum += disp_distance;
    }
    //将超出边界的点移回来
    adjustPlace(nl_w, nl_h, dataset);
    //改变温度
    cool(nl_w, nl_h, dataset);
}

function fr(k_fr, d_fr, weight_fr)
{
	if(d_fr < 0.001) d_fr = 0.001;
	return weight_fr * k_fr * k_fr/ d_fr;
}

function fa(k_fa, d_fa, weight_fa)
{
	return weight_fa * d_fa * d_fa / k_fa;
}

function adjustPlace(nl_w, nl_h, dataset)
{
	var key = Object.keys(dataset);
	var node_name = key[0];
	var edge_name = key[1];
	//水平方向
	var x_min = d3.min(dataset[node_name], function(d, i){
		return d["position"]["x"];
	});
	var x_max = d3.max(dataset[node_name], function(d, i){
		return d["position"]["x"];
	}); 
	if(x_min < 0 || x_max > nl_w)
	{
		var x_scale = d3.scale.linear()
	                .domain([x_min, x_max])
	                .range([nl_w * 0.02, nl_w * 0.98]);
	    dataset[node_name].forEach(function(d, i){
	    	d["position"]["x"] = x_scale(d["position"]["x"]);
	    });
	}
	//垂直方向
	var y_min = d3.min(dataset[node_name], function(d, i){
		return d["position"]["y"];
	});
	var y_max = d3.max(dataset[node_name], function(d, i){
		return d["position"]["y"];
	});
	if( y_min < 0 || y_max > nl_h)
	{
		var y_scale = d3.scale.linear()
		                .domain([y_min, y_max])
		                .range([nl_h * 0.02, nl_h * 0.98]);
		 dataset[node_name].forEach(function(d, i){
		 	d["position"]["y"] = y_scale(d["position"]["y"]);
		 })
	}
}

function cool(nl_w, nl_h, dataset)
{
	var key = Object.keys(dataset);
	var node_name = key[0];
	var edge_name = key[1];
	var step = Math.min(nl_w, nl_h) / 2 / dataset[node_name].length * 0.15;
	nl_temperature -= nl_graph_time * step;
	if(nl_temperature < 5)
	{
		nl_temperature = 5;
	}
}

function nl_plot(place, dataset, nl_w, nl_h, nl_padding)
{
	for(var i =0; i< 300; i++)
	{
		nl_graph_new(dataset, nl_w, nl_h);
		console.log("i = " + i);
	}
	var key = Object.keys(dataset);
	var node_name = key[0];
	var edge_name = key[1];
 var drag = d3.behavior.drag()
                .on("dragstart", dragstart)
                .on("drag", dragmove)
                .on("dragend", dragend);
    //标签
	var tip = d3.tip()
              .attr('class', function(d){
                  return "d3-tip-graph";
              })
              .offset([-10, 0])
              .html(function(d) {
                return "<strong></strong> <span style='color:white'>" + keywords[+(d["name"].substring(1))]["word"] + "</span>";
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
                      users[index]["keyword"].forEach(function(d_k, i_k){
                          user_keywords = user_keywords + " " +keywords[+d_k]["word"];
                      });
                        return "<strong></strong> <span style='color:white'>" + users[index]["uid"] + ":"+ user_keywords + "</span>";
                   });
  //边的权重映射函数
    var  edge_weight_scale = d3.scale.linear()
                            .domain(d3.extent(dataset[edge_name], function(d, i){
                               return d["weight"];
                            }))
                            .range([1, 10]);
  //user权重的映射


	var svg = d3.select("#nl_graph")
	            .append("svg")
	            .attr("width", nl_w + 2 * nl_padding)
	            .attr("height", nl_h + 2 * nl_padding)
	            .append("g")
	            .attr("transform", "translate(0, 0)");
	 var edges = svg.selectAll("line")
	                .data(dataset[edge_name])
	                .enter()
	                .append("line")
	                .attr("x1", function(d, i){
	                	var index = d["source"];
	                	    index = (+index);
	                	return dataset[node_name][index]["position"]["x"];
	                })
	                .attr("y1", function(d, i){
	                	var index = d["source"];
	                	    index = (+index);
	                	return dataset[node_name][index]["position"]["y"];
	                })
	                .attr("x2", function(d, i){
	                	var index = d["target"];
	                	    index = (+index);
	                	 return dataset[node_name][index]["position"]["x"];
	                })
	                .attr("y2", function(d, i){
	                	var index = d["target"];
	                	    index = (+index);
	                	return dataset[node_name][index]["position"]["y"];
	                })
	                .attr("class", function(d, i){
	                	return "s" + d["source"] + " " + "t" + d["target"];
	                })
	                .style("stroke", "rgb(122, 131, 142)")
	                .style("stroke-width", 5);
	               /*.style("stroke-width", function(d, i){
                     return edge_weight_scale(d["weight"]);
                  });*/
	var nodes_g = svg.selectAll("g")
	                 .data(dataset[node_name])
	                 .enter()
	                 .append("g")
	                 .attr("transform", function(d, i){
	                 	return "translate(" + d["position"]["x"] + "," + d["position"]["y"] + ")";
	                 })
	                 .attr("class", function(d, i)
	                 {
	                 	 return d["name"][0];
	                 })
	                 .attr("id", function(d, i){
	                 	var type = d["name"][0];
	                 	return type + d["index"];
	                 })
	                 .call(drag);

	 var nodes_u = d3.selectAll(".u")
                     .append("circle")
                     .attr("r", 15)
                     .attr("cx", 0)
                     .attr("cy", 0)
                     .attr("class", function(d, i){
                     	 return d["name"] + " u" + d["index"];
                     })
                     .attr("fill", function(d, i){
                     	var index = d["name"].substring(1);
                     	   index = (+index);
                       return color_u(index);
                     })
                     .call(user_tip)
                     .on("mouseover", user_tip.show)
                     .on("mouseout", user_tip.hide);
      var nodes_k = d3.selectAll(".k")
                      .append("rect")
                      .attr("x", -10)
                      .attr("y", -10)
                      .attr("width", 20)
                      .attr("height", 20)
                      .attr("class", function(d, i){
                      	  return d["name"] + " k" + d["index"];
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
   //drag开始，改变颜色
   function dragstart()
   {
   	var index;
          index = d3.select(this)
                    .attr("id");
       d3.select("." + index)
         .attr("fill", "green");
   }
   //drag的时候，改变点的位置
   function dragmove()
   {
   	  var x = d3.event.x;
   	  var y = d3.event.y;
   	  var index1;
          index1 = d3.select(this)
                    .attr("id");
          index1 = index1.substring(1);
          index1 = (+index1);
      dataset[node_name][index1]["position"]["x"] = x;
      dataset[node_name][index1]["position"]["y"] = y;
      d3.select(this)
        .attr("transform", "translate(" + x + "," + y + ")");
      d3.select(place)
        .selectAll("line")
        .attr("x1", function(d, i){
	          var index = d["source"];
	              index = (+index);
	          return dataset[node_name][index]["position"]["x"];
	      })
	    .attr("y1", function(d, i){
	          var index = d["source"];
	               index = (+index);
	           return dataset[node_name][index]["position"]["y"];
	       })
	    .attr("x2", function(d, i){
	          var index = d["target"];
	               index = (+index);
	           return dataset[node_name][index]["position"]["x"];
	       })
	     .attr("y2", function(d, i){
	           var index = d["target"];
	                index = (+index);
	            return dataset[node_name][index]["position"]["y"];
	       })
   }
   //drag结束的时候，点变回原来的颜色
   function dragend()
   {
      var index;
          index = d3.select(this)
                    .attr("id");
      var type = index.substring(0, 1);
         index = index.substring(1);
         index = (+index);
      d3.select("." + type + index)
        .attr("fill", function(d, i){
          var index = d["name"].substring(1);
                index = (+index)
        	if(type == "k")
        	{
        		return color_k(index);
          }
        	if(type == "u")
        	{
        		return color_u(index);
        	}
        })
   }
}