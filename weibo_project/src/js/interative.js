function time_line()
{
	var margin = {top:20, right:5, bottom:20, left:20}
  var w = window.screen.width * 0.03;
  var h = window.screen.height * 0.78;
  var time_tick = ["Sep 01", "Sep 05", "Sep 10", "Sep 15", "Sep 20", "Sep 25", "Sep 30", "Oct 05", "Oct 10"];
   time_line_y = d3.scale.linear()
             //.domain([new Date("2014-09-01 00:00:00"), new Date("2014-10-10 00:00:00")])
             .domain([0,40])
             .range([0, h]);
var yAxis = d3.svg.axis()
              .scale(time_line_y)
              .orient("left")
              .ticks(40);
var brush = d3.svg.brush()
              .y(time_line_y)
              .on("brush", brushed)
              .on("brushend", brushover);

var svg = d3.select("#left").append("svg")
           .attr("width", w + margin.left + margin.right)
           .attr("height", h + margin.top + margin.bottom);

var context = svg.append("g")
                 .attr("class", "context")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  context.append("g")
         .attr("class", "y axis")
         .attr("transform", "translate(0,0)")
         .call(yAxis);
   d3.selectAll(".axis .tick text")
     .attr("transform", "rotate(90)")
     .attr("y",15)
     .attr("x", 20)
     .text(function(d, i){
      if(i%5 == 0)
      {
       return time_tick[i/5];
      }
     });
  d3.selectAll(".axis .tick line")
    .attr("x2", function(d, i){
      if(i%5 == 0)
      {
        return -10;
      }
      else
      {
         return -4;
      }
    });

  context.append("g")
         .attr("class", "y brush")
         .call(brush)
         .selectAll("rect")
         .attr("x", 0)
         .attr("width", w+2);


   function brushed() 
 {
      
 }
   function brushover()
 {
     remove_map_All();     //拖动时间，map里的所有东西都消失
     var y1 = Math.floor(brush.extent()[0]);
     var y2 = Math.floor(brush.extent()[1]);
      if((brush.extent()[0] - y1) > 0.5)
    {
      y1 = y1 + 1;
    }
       if((brush.extent()[1] - y2) > 0.5)
    {
       y2 = y2 + 1;
    }
    time_start = y1;
     time_end = y2;
    d3.select(".brush .extent")
      .attr("y", time_line_y(y1))
      .attr("height", time_line_y(y2 - y1));
   //y1， y2表示起始时间和结束的时间   我需要一个函数，提供起始和结束的时间，返回这个时间段内的keyword
   creat_cloud_div(y1, y2);
   //在cloud_div里面，添加标签云
     if( y1 != y2)
   {
    var keyword_array = keylist_by_time(y1, y2);
    console.log("keyword_array:" + keyword_array);
     genereate_cloud(keyword_array);
   }
   else
   {
      delete_graph_panel();
   }
 }
    function creat_cloud_div(y1, y2)
 {
      //删除cloud_tag内已经有的数据
     $("#word_cloud> span").remove();
      var triangle_size = 6;
      var cloud_tag_size = 300;   //cloud_div的大小，可能需要根据key的多少来设定
      var place = time_line_y((y2 + y1)/2);
    if(y1 != y2)
    {
      d3.select("#word_cloud")
        .classed("hidden_cloud",false)
        .style("left", (w + margin.left + 6 + triangle_size * 2) + "px")
        .style("top",place + "px")
        .style("width",cloud_tag_size + "px")
        .style("height", cloud_tag_size + "px");
      d3.select("#triangle_cloud")
        .classed("hidden_cloud",false)
        .style("left",  (w + margin.left + 6 + triangle_size)+"px")
        .style("top",  (place + cloud_tag_size * 0.1 ) + "px")
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
 }
}*/