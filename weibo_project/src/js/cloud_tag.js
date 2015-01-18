
   function genereate_cloud(keyword_array)  //keyword的index
{
	 /*var keyword_array = [1, 2,3];*/
	//根据时间获取相应的keyword 及其weight，传给create_cloud
	 var cloud_array = [];
	 keyword_array.forEach(function(d, i){
        //console.log("i = " + i + ";" + "word" + keywords[+d["kid"]]["word"]);
         cloud_array.push(creat_cloud (keywords[+d["kid"]]["word"], Math.log(d["weight1"]), d["kid"]));
 	});
	$(function(){
          $("#word_cloud").jQCloud(cloud_array, {
            width:150,
            height:150
          });
     });

	function creat_cloud(keyword, k_weight, index)
  {
      var keyword_obj;
      keyword_obj = {
        //text:keyword + " " + d3.round(+k_weight),
        text:keyword,
        weight: k_weight,
        html:{
          class: "cloud_tag_color k" + index ,
          title: keyword
        },
        handlers:{
          click:function(){      
             var isSelected = false;
             var class_array = d3.select("#word_cloud")
                                .select(".k" + index)
                                .attr("class");
             var class_index = class_array.indexOf("selected");
             if(class_index != -1 )
             {
                isSelected = true;
             }
             if(isSelected == false)
             {
                d3.select(".k"+ index)
                  .classed("selected", true)
                  .style("color", function(d, i){
                    return color_k(+index);
                  });
                  console.log("index:" + index)
              var obj = {};
                  obj[index] = weibolist_by_keyword(index);
                  addCircle(obj);
                  draw_keyword_panel(index);
                 ThemeRiver(index, weibo_num_by_keyword(index));
                  //addRect([1, 2])  //测试用
                //say_hello(keyword);  //调用pannel的函数，可以将相应的关键词或是它的id传出去
           }
           else
           {
              console.log("delete click")
              remove_keyword_tag(index);
              delete_keyword_panel(index);
              delete_graph_panel();
              remove_data_ready(index);
           }
          }
        }
      }
      return keyword_obj;
  }

  function say_hello(a)
  {
  	 alert(a);
  }
}

function remove_keyword_tag(index)
{
   d3.select(".k" + index)
                .classed("selected", false)
                .style("color", function(d, i){
                    color_k(+index);
                });
  removeCircle(index);
}