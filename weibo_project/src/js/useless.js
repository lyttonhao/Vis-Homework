function data_deal(keyword_a)   //keyword的index 数组 
{
    var nl_w = window.screen.width * 0.65;
    var nl_h = window.screen.height * 0.65;
    var nl_padding = 20;
	  var keyword_array = [1,2];
	  var keyword_user = {};
	  var nl_edge = [];
    var nl_vertix = {};
	var nl_vertix_index = [];
	keyword_array.forEach(function(d, i){
		 d = (+d);
        var related_weibo = keywords[d]["weibo"]; //数组
        if(nl_vertix["k" + d] == undefined)
        {
        	nl_vertix["k" + d] = {};
            nl_vertix["k" + d]["keyword"] = keywords[d]["word"];
            nl_vertix["k" + d]["id"] = d;
            nl_vertix["k" + d]["weight"] = related_weibo.length;
           /* nl_vertix["k" +d]["position"] = {};
            nl_vertix["k" + d]["position"]["x"] = Math.max(Math.random() * (nl_w - 2*nl_padding, nl_padding));
            nl_vertix["k" + d]["position"]["y"] = Math.max(Math.random() * (nl_h - 2*nl_padding, nl_padding));
            nl_vertix["k" + d]["disp"] = {};
            nl_vertix["k" + d]["disp"]["x"] = 0;
            nl_vertix["k" + d]["disp"]["y"] = 0;*/
            nl_vertix["k" + d]["color"] = "white";
            nl_vertix["k" + d]["edge"] = [];
            nl_vertix_index.push("k" + d);
        }
        related_weibo.forEach(function(d_weibo){
        	d_weibo = (+d_weibo);
            var user_id = weibos[d_weibo]["user"];
            var u_key = "u" + user_id;
            if(nl_vertix[u_key] == undefined)
            {
            	nl_vertix[u_key] = {};
            	nl_vertix[u_key]["keyword"] = user_id;
            	nl_vertix[u_key]["id"] = user_id;  //这里填写的应该是user的index的
            	nl_vertix[u_key]["weight"] = 5;
                /*nl_vertix[u_key]["position"] = {};
                nl_vertix[u_key]["position"]["x"] = Math.max(Math.random() * (nl_w - 2*nl_padding, nl_padding));
                nl_vertix[u_key]["position"]["y"] = Math.max(Math.random() * (nl_h - 2*nl_padding, nl_padding));
                nl_vertix[u_key]["disp"] = {};
                nl_vertix[u_key]["disp"]["x"] = 0;
                nl_vertix[u_key]["disp"]["y"] = 0;*/
                nl_vertix[u_key]["color"] = "red";
                nl_vertix[u_key]["edge"] = [];
                nl_vertix_index.push(u_key);
            }
             add_edge("k" +d, u_key);
        });
	});
   function add_edge(v1, v2)
   {
   	  var edge_len = nl_edge.length;
   	  var isHas = false;
   	  for(var i =0; i< edge_len; i++)
   	  {
         if((nl_edge[i]["vertix1"] == v1 && nl_edge[i]["vertix2"] == v2) 
         	|| (nl_edge[i]["vertix1"] == v2 && nl_edge[i]["vertix2"] == v1))
         {
         	isHas = false;
         	break;
         }
   	  }
   	 if(isHas == false)
   	 {
   	 	var obj = {};
   	 	obj["vertix1"] = v1;
   	 	obj["vertix2"] = v2;
   	 	nl_edge.push(obj);
   	 	nl_vertix[v1]["edge"].push(edge_len);
   	 	nl_vertix[v2]["edge"].push(edge_len);
   	 }
   }
     var dataset ={};
      dataset["nodes"] = [];
      dataset["edges"] = [];
     var nodes_key = Object.keys(nl_vertix);
     nodes_key.forEach(function(d_key, i_key){
     	var obj = {};
     	obj["name"] = d_key;
     	dataset["nodes"].push(obj);
     	nl_vertix[d_key]["index"] = i_key;
     });
     nl_edge.forEach(function(d_edge, i_edge){
     	var obj = {};
     	var index1 = nl_vertix[d_edge["vertix1"]]["index"];
     	var index2 = nl_vertix[d_edge["vertix2"]]["index"]
     	obj["source"] = index1;
     	obj["target"] = index2;
     	dataset["edges"].push(obj);
     });
    force_graph("#nl_graph", nl_w, nl_h, nl_padding);
     //调用FDLayout函数
	/*FDLayout(nl_w * 0.8, nl_h*0.8, nl_padding*0.9, nl_vertix_index,nl_vertix,nl_edge);
	if(setInterval_num == 1)
	{
		console.log("good-bye")
       intervalID = window.setInterval("FDLayout(nl_w * 0.8, nl_h*0.8, nl_padding*0.9, nl_vertix_index,nl_vertix,nl_edge)",setInterval_num * 0.2);
	}*/