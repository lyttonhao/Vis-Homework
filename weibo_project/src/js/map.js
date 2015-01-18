//加载基本的地图
function initialize()
{
  //设置地图的透明度
  var styles = [{
    stylers: [
        { lightness: 60,
          color:"#d0e2e1"}
      ]
  }];
    var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});
    var mapOptions = {
          center: new google.maps.LatLng(39.92, 116.46),  //24,-80
          zoom: 10,
          disableDefaultUI:true,
          mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
           },
          //mapTypeId: google.maps.MapTypeId.ROADMAP,   //TERRAIN 自然特征， ROADMAP 普通街道地图
          maxZoom:14,
          minZoom:9,
          draggableCursor:"auto",
        };
        
      map = new google.maps.Map(d3.select("#map").node(), mapOptions);
      map.mapTypes.set('map_style', styledMap);
      map.setMapTypeId('map_style');
}  

//在地图上绘制基本的元素
  function addCircle(data)    //传入的参数也许这样更好：{keyword_index1:[], keyword_index2:[]}
{
   var tip = d3.tip()
              .attr('class', function(d){
                  return "d3-tip";
              })
              .offset([-10, 0])
              .html(function(d) {
                var weibo_d = (+d);
                return "<strong></strong> <span style='color:white'>" + weibos[weibo_d]["text"] + "</span>";
              });
   //创建测试数据
  var div_index = Object.keys(data);
   var overlay = new google.maps.OverlayView();
   overlay.onAdd = function(){
   var layer = d3.select(this.getPanes().floatPane)    //层面会影响交互。谷歌地图自行定义了很多层次，将自定义元素放置在最上层，这样就可以进行交互了
                             .append("div")
                             .attr("class", "keyWord_place circle div_k div_k" + div_index[0]);
     overlay.draw = function(){
        var projection = this.getProjection();
        var keyword_index = Object.keys(data);
        //设置比例尺，根据keyword的权重，确定圆的大小
        var r_scale = d3.scale.linear()
                        .domain(d3.extent(keyword_index, function(d){
                             return keywords[+d]["weight"];
                        }))
                        .range([5, 8]);
      keyword_index.forEach(function(d_k, i_k){
            var marker = layer.selectAll(".k" + d_k)
                              .data(data[d_k])
                              .each(transform);
                        marker.enter()
                              .append("svg:svg");
                        marker.each(transform)
                              .attr("id", function(d_w, i_w){
                                  return "w" + d_w;
                              })
                              .attr("class", "k" + d_k);
                        d3.selectAll(".circle .k" + d_k + " circle")
                          .remove();

                        marker.append("circle")
                              .attr("r", function(){
                                 var size_r = map.getZoom();
                                 if(size_r == 11)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) *1.5;
                                 }
                                 else if(size_r >= 12)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) * 2;
                                 }
                                 else if(size_r < 11)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]);
                                 }
                              })
                              .attr("cx",  function(){
                                   var size_r = map.getZoom();
                                 if(size_r == 11)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) *1.5 + 3;
                                 }
                                 else if(size_r >= 12)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) * 2 + 3;
                                 }
                                 else if(size_r < 11)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) + 3;
                                 }
                              })
                              .attr("cy",function(){
                                    var size_r = map.getZoom();
                                 if(size_r == 11)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) *1.5 + 3;
                                 }
                                 else if(size_r >= 12)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) * 2 + 3;
                                 }
                                 else if(size_r < 11)
                                 {
                                    return r_scale(keywords[+d_k]["weight"]) + 3;
                                 }
                              })
                              .attr("size", function(){
                                 return  d3.select(this)
                                           .attr("r");
                              })
                              .attr("class", function(d_w, i_w){
                                  return "w" + d_w;
                              })
                              .attr("stroke", color_k(+d_k))
                              .attr("stroke-width", "3px")
                              .attr("fill","white")
                             // .attr("stroke", "black")
                              .attr("opacity", 0.7)
                              .call(tip)
                              .on("mouseover",tip.show)
                              .on("mouseout",tip.hide);
                          marker.exit().remove();
        });
      //将经纬度坐标转化为div里的像素坐标
       function transform (d)   //d表示微博的index
       {
          var weibo_d = (+d);
          var lat = weibos[weibo_d]["lat"] + Math.random() * 0.001;
          var lng = weibos[weibo_d]["lng"] + Math.random() * 0.001 ;
          var MapCoords = new google.maps.LatLng(lat, lng);
          var PixlCoords = projection.fromLatLngToDivPixel(MapCoords);
          return d3.select(this)
                   .style("left", PixlCoords.x + "px")
                   .style("top", PixlCoords.y + "px");
       }

        /*google.maps.event.addListener(map, "zoom_changed", function(){
          var size = map.getZoom();
          console.log("zoom_change=" + size);
          if(size == 11)
          {
             d3.select(".div_k")
               .selectAll("circle")
               .transition()
               .duration(100)
               .attr("r", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r * 2;
               })
               .attr("cx", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r * 2;
               })
               .attr("cy", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r * 2;
               })
          } 
          else if( size >= 12)
          {
             d3.select(".div_k")
               .selectAll("circle")
               .transition()
               .duration(100)
               .attr("r", function(d_r, i_r){
                  var size_r = $(".div_k >svg> .w" + d_r).attr("size");
                  console.log("size > =12");
                 return size_r * 3;
               })
               .attr("cx", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r * 3;
               })
               .attr("cy", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r *3;
               })
          }
          else if(size <11)
          {
            d3.select(".div_k")
               .selectAll("circle")
               .transition()
               .duration(100)
               .attr("r", function(d_r, i_r){
                  var size_r = $(".div_k > svg>.w" + d_r).attr("size");
                 return size_r;
            })
               .attr("cx", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r ;
               })
               .attr("cy", function(d_r, i_r){
                var size_r = $(".div_k >svg>.w" + d_r).attr("size");
                console.log("size =11")
                  return size_r ;
               })
          }
      })*/
     };
   };
   overlay.setMap(map); //将自定义的元素添加到map上
}

function addRect(data) //绘制user的相关微博  传入的参数同上
{
   d3.selectAll(".div_k")
     .selectAll("circle")
     .style("opacity", 0.3);
    var tip = d3.tip()
              .attr('class', function(d){
                  return "d3-tip";
              })
              .offset([-10, 0])
              .html(function(d) {
                var weibo_d = (+d);
                return "<strong></strong> <span style='color:white'>" +weibos[weibo_d]["text"] + "</span>";
              });
   /*//创建测试数据
   var data = {};
     data["0"] = [];
     data["0"].push(41);
     data["0"].push(171);
     data["0"].push(295);*/
   var div_index = Object.keys(data);
   var overlay = new google.maps.OverlayView();
   overlay.onAdd = function(){
   var layer = d3.select(this.getPanes().floatPane)    //层面会影响交互。谷歌地图自行定义了很多层次，将自定义元素放置在最上层，这样就可以进行交互了
                             .append("div")
                             .attr("class", "keyWord_place rect div_u div_u" + div_index[0]);
     overlay.draw = function(){
        var projection = this.getProjection();
        var user_index = Object.keys(data);
        //设置比例尺，根据keyword的权重，确定圆的大小
        var size_scale = d3.scale.linear()
                        .domain(d3.extent(user_index, function(d){
                             return users[+d]["keyword"].length;
                        }))
                        .range([8, 12]);
        user_index.forEach(function(d_u, i_u){
            var marker = layer.selectAll(".u" + d_u)
                              .data(data[d_u])
                              .each(transform);
                        marker.enter()
                              .append("svg:svg");
                        marker.each(transform)
                              .attr("id", function(d_w, i_w){
                                  return "w" + d_w;
                              })
                              .attr("class", "u" + d_u);
                       d3.selectAll(".rect .u" + d_u + " rect")
                          .remove();
                        marker.append("rect")
                              .attr("x", 5)
                              .attr("y", 5)
                              //.attr("width", size_scale(users[+d_u]["keyword"].length))
                              //.attr("height", size_scale(users[+d_u]["keyword"].length))
                              .attr( "width", function(){
                                 var size_rect = map.getZoom();
                                 if(size_rect == 11)
                                 {
                                    return size_scale(users[+d_u]["keyword"].length) *1.5 ;
                                 }
                                 else if(size_rect >= 12)
                                 {
                                    return size_scale(users[+d_u]["keyword"].length) * 2 ;
                                 }
                                 else if(size_rect < 11)
                                 {
                                    return size_scale(users[+d_u]["keyword"].length) ;
                                 }
                              })
                              .attr( "height", function(){
                                 var size_rect = map.getZoom();
                                 if(size_rect == 11)
                                 {
                                    return size_scale(users[+d_u]["keyword"].length) *1.5 ;
                                 }
                                 else if(size_rect >= 12)
                                 {
                                    return size_scale(users[+d_u]["keyword"].length) * 2;
                                 }
                                 else if(size_rect < 11)
                                 {
                                    return size_scale(users[+d_u]["keyword"].length)   ;
                                 }
                              })
                              .attr("fill", "white")
                              //.attr("stroke", color_u(+d_u))
                              .attr( "stroke", "#2AFD08")
                              .attr("stroke-width", "3px")
                              //.attr("stroke", "green")
                              .attr("opacity", 0.9)
                              .attr("rx", "1px")
                              .attr("ry", "1px")
                              .call(tip)
                              .on("mouseover",tip.show)
                              .on("mouseout",tip.hide);
                          marker.exit().remove();

        })
      //将经纬度坐标转化为div里的像素坐标
       function transform (d)   //d表示微博的index
       {
          var weibo_d = (+d);
          var lat = weibos[weibo_d]["lat"] + Math.random() * 0.001;
          var lng = weibos[weibo_d]["lng"] + Math.random() * 0.001;
          var MapCoords = new google.maps.LatLng(lat, lng);
          var PixlCoords = projection.fromLatLngToDivPixel(MapCoords);
          return d3.select(this)
                   .style("left", PixlCoords.x + "px")
                   .style("top", PixlCoords.y + "px");
       }
     };
   };
   overlay.setMap(map); //将自定义的元素添加到map上
}

function removeCircle(data) //传入的是keyword的index，每次传入一个数
{
        d3.select(".div_k" + data)
          .remove();
}

function removeRect(data) //同removeCircle
{
       d3.select(".div_u" + data)
          .remove();
      d3.selectAll(".div_k")
        .selectAll("circle")
        .style("opacity", 0.7);
}

function remove_map_All()
{
   d3.selectAll(".keyWord_place")
     .remove();
}
function hover_on_weibo(w_index)
{
  d3.selectAll(".keyWord_place .w" + w_index)
    .transition()
    .duration(1000)
    .attr("r", function(d, i){
        var r = d3.select(this)
                  .attr("size");
         return 2 * r;
    })
    .attr("cx", function(d, i){
      var r = d3.select(this)
                .attr("size");
          return 2 * r;
    })
    .attr("cy", function(d, i){
      var r = d3.select(this)
                .attr("size");
          return 2 * r;
    })
    .attr("fill","#F9ED0B" );
}

function hover_out_weibo(w_index)
{
   
    d3.selectAll(".keyWord_place .w" + w_index)
    .transition()
    .duration(1000)
    .attr("r", function(d, i){
      var r = d3.select(this)
                .attr("size");
          return r;
    })
    .attr("cx", function(d, i){
      var r = d3.select(this)
                .attr("size");
          return  r ;
    })
    .attr("cy", function(d, i){
      var r = d3.select(this)
                .attr("size");
          return  r ;
    })
    .attr("fill", "white");
}