var key_data = [];   //主题河流：全局變量，存儲index
var test_data = [];  //主题河流：全局變量，存儲具體的數據
var color_u= d3.scale.category20();
var color_k = d3.scale.category10();
var keywords;
var weibos;
var users;
var kw_threshold = 20;
var user_threshold = 10;
var days = 30;
var time_start, time_end;

d3.json("data/savdata0.3_30.json", function(data){
         keywords = data["keywords"];
         weibos = data["weibos"];
         users = data["users"];
         initialize();   //地图初始化
         ThemeRiver("weibo", weibo_num_by_day());

        // console.log( keywords[0]["word"] );
});