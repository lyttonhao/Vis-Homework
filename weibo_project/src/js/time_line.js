
var data = [];
  for(var i =0; i<41; i++)
  {
     data.push(Math.random() * 5);
  }

//測試樣例
/*ThemeRive("0", data);  
alert("Hello, weibo");
ThemeRive("1", data);
alert("hello," + key_data[key_data.length-1]);
ThemeRive("2", data);
alert("delete");
remove_data_ready("lly");
alert("delete all")
remove_themeRiver_All();*/
function ThemeRiver(index, data)
{
      var isLength = d3.select("#left svg");
          isLength = isLength[0];
      var margin = {top:20, right:5, bottom:20, left:20}
      var w = window.screen.width * 0.05;
      var h = window.screen.height * 0.78;
      var time_tick = ["Sep 01", "Sep 05", "Sep 10", "Sep 15", "Sep 20", "Sep 25", "Sep 30", "Oct 05", "Oct 10"];
      var time_line_y = d3.scale.linear()
                          .domain([0,days-1])
                          .range([0, h]);
      var yAxis = d3.svg.axis()
                         .scale(time_line_y)
                         .orient("left")
                         .ticks(days-1);
      var brush = d3.svg.brush()
                        .y(time_line_y)
                        .on("brush", brushed)
                        .on("brushend", brushover);
    if(isLength[0] == null)
    {
       var svg = d3.select("#left").append("svg")
                   .attr("width", w + margin.left + margin.right)
                   .attr("height", h + margin.top + margin.bottom); 
       svg.append("g")
          .attr("transform", "translate(0, " + margin.top + ")")
          .attr("class", "y brush")
          .call(brush)
          .selectAll("rect")
          .attr("x", 0)
          .attr("width", w+2);

        var context = svg.append("g")
                         .attr("class", "context")
                         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        context.append("g")
               .attr("class", "y axis")
               .attr("transform", "translate(0,0)")
               .call(yAxis);
    d3.selectAll(".y .tick line")
      .attr("x2", function(d, i){
      if( i == 0)
      {
          return -10
      }
       else if((i + 1)%5 == 0)
      {
        return -10;
      }
         else
      {
         return -4;
      }
     });

   d3.selectAll(".axis .tick text")
     .attr("transform", "rotate(90)")
     .attr("y",15)
     .attr("x", 20)
     .text(function(d, i){
      if( i == 0)
      {
         return time_tick[0];
      }
      if((i + 1)%5 == 0)
      {
       return time_tick[(i + 1)/5];
      }
     });
     add_data_ready("weibo", data);
     themeRiver();
   }
   else
   {
        add_data_ready(index, data);
        themeRiver()
   }

   function brushed() 
 {
      
 }
   function brushover()
 {
     remove_map_All();     //拖动时间，map里的所有东西都消失
     remove_themeRiver_All();  //theme river，删除所有
     delete_all_keyword_panel();
     var y1 = Math.floor(brush.extent()[0]);
     var y2 = Math.floor(brush.extent()[1]);
     console.log(y1)
     console.log(y2)
      if((brush.extent()[0] - y1) > 0.5)
    {
      y1 = y1 + 1;
    }
       if((brush.extent()[1] - y2) > 0.5)
    {
       y2 = y2 + 1;
    }
    time_start = y1;
    time_end = y2 ;
    d3.select(".brush .extent")
      .attr("y", time_line_y(y1))
      .attr("height", time_line_y(y2 - y1));
   //y1， y2表示起始时间和结束的时间   我需要一个函数，提供起始和结束的时间，返回这个时间段内的keyword
   creat_cloud_div(y1, y2);
   //在cloud_div里面，添加标签云
     if( y1 != y2)
   {
    var keyword_array = keylist_by_time();
     genereate_cloud(keyword_array);
   }
   else
   {
      delete_all_keyword_panel();
      delete_graph_panel();
   }
  } 
  function creat_cloud_div(y1, y2)
 {
      //删除cloud_tag内已经有的数据
     $("#word_cloud> span").remove();
      var triangle_size = 6;
      var cloud_tag_size = 150;   //cloud_div的大小，可能需要根据key的多少来设定
      var border = 20;
      var place = time_line_y((y2 + y1)/2);
    if(y1 != y2)
    {
      d3.select("#word_cloud")
        .classed("hidden_cloud",false)
        .style("left", (w + margin.left  + triangle_size) + "px")
        .style("top",(place - cloud_tag_size/2) + "px")
        .style("width", (cloud_tag_size + border )+ "px")
        .style("height", (cloud_tag_size + border )+ "px");
      d3.select("#triangle_cloud")
        .classed("hidden_cloud",false)
        .style("left",  (w + margin.left)+"px")
        .style("top",  (place ) + "px")
        .style("width", triangle_size + "px")
        .style("height", 2 * triangle_size +"px")
        .style("border-top-left-radius", triangle_size + "px")
        .style("border-bottom-left-radius", triangle_size + "px");
    }
    else
    {
       d3.select("#word_cloud")
         .classed("hidden_cloud", true);
      d3.select("#triangle_cloud")
        .classed("hidden_cloud", true);
    }

    if(place <=(cloud_tag_size/2) )
    {
       d3.select("#word_cloud")
         .style("left", (w + margin.left + triangle_size ) + "px")
         .style("top",5 + "px");
       d3.select("#triangle_cloud")
         .style("left",  (w + margin.left)+"px")
         .style("top",  (place) + "px")
    }

    if((time_line_y(days- 1)- place) <((cloud_tag_size/2) - 10))
    {
       d3.select("#word_cloud")
         .style("top", (window.screen.height *0.75 - cloud_tag_size + 10) + "px");
       d3.select("#triangle_cloud")
         .style("top", (place) + "px")
    }
 }  
}

  function themeRiver()
{
   var w = window.screen.width * 0.04;
   var h = window.screen.height * 0.78;
      var time_line_y = d3.scale.linear()
                          .domain([0,days-1])
                          .range([0, h]);
     var area = d3.svg.area()
                  .interpolate("basis")   //插值方法，我觉得效果不错
                  .y(function(d) {return time_line_y(d.y) })
                  .x0(function(d){return time_line_x(d.x0) })
                  .x1(function(d){return time_line_x(d.x0+d.x) });
   var time_line_x = d3.scale.linear()
                       .domain([0, d3.max(test_data[test_data.length-1], function(d, i){
                           return d["x"] + d["x0"];
                         })])
                       .range([0, w]);
  var context_area = d3.select(".context")
                       .selectAll(".generator")
                       .data(test_data);
           context_area.enter()
                       .append("svg:path");

   context_area.attr("class", function(d, i){
                  return "generator " + "rk"+ key_data[i];
                 })
              .style("fill", function(d, i){
                if(key_data[i] != "weibo")
                {

                  return color_k(+key_data[i]);
                }
                else
                {
                   return "red";
                }
               })
              .attr("opacity",0.5)
              .style("stroke", function(d, i){
                  return d3.rgb(color_k(i)).darker();
               })
              .attr("d", area);
   context_area.exit()
               .remove();
 }

function remove_data_ready(index)
{
    var place;
    for(var i =0;  i<key_data.length; i++)
    {
       if(key_data[i] == index)
       {
         place = i;
         break;
       }
    }
    for(var i = place; i<test_data.length-1; i++)
    {
       test_data[i] = test_data[i+1];
       key_data[i] = key_data[i+1];
    }
    test_data.pop();  
    test_data.forEach(function(d, i){
       for(var j = 0; j<d.length; j++)
       {
          if(i == 0)
          {
            test_data[i][j]["x0"] = 0;
          }
          else
          {
            test_data[i][j]["x0"] = test_data[i-1][j]["x"] + test_data[i-1][j]["x0"];
          }
       }
    });
    if(test_data.length == 0)
    {
        test_data = [];
        key_data = [];
        ThemeRiver("weibo", weibo_num_by_day());
    }
    else
    {
       themeRiver();
     }
}

function add_data_ready(index, data)  //index表示keyword的下標， data是一個數組
{
   var len = test_data.length;
   for(var i=len; i>0; i--)
   {
      test_data[i] = test_data[i-1];
      key_data[i] = key_data[i-1];
   }
   test_data[0] = [];
   key_data[0] = index;
   len ++;
   for(var i =0; i<data.length; i++)
   {
      var obj1 = {};
      obj1["y"] = i;
      obj1["x"] = data[i];
      obj1["x0"] = 0;
      test_data[0].push(obj1);
   }
   for(var i =1; i<len; i++)
   {
      for(var j =0; j<data.length; j++)
      {
         test_data[i][j]["x0"] = (+test_data[i-1][j]["x"]) + (+test_data[i-1][j]["x0"]);
      }
   }

   if(key_data[key_data.length-1] == "weibo" && key_data.length != 1)
   {
       key_data.pop();
       test_data.pop();
   }
}

function remove_themeRiver_All()
{
   test_data = [];
   key_data = [];
   ThemeRiver("weibo", weibo_num_by_day());
}



 

 
