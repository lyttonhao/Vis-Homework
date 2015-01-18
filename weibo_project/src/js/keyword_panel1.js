
var keyword_selected_list = [];
var selected_user = {};

function keyword_to_weibos( kid ) {
	return keywords[kid]["weibo"];
}

function draw_keyword_panel( kid ) {
	selected_user[kid] = -1;
	var uid_list = topuser_by_key( kid );
	var panel = d3.select('#top-row').append("div").attr("class", "panel panel-info keypanel")
					.attr("id", "keyword"+kid);

	var panel_head = panel.append("div").attr("class", "panel-heading clearfix");
	var panel_body = panel.append("div").attr("class", "panel-body").append("div");

	panel_head.append("h4").attr("class", "panel-title pull-left").text(keywords[kid]['word']);
	panel_head.attr("style", "background-color: "+color_k(kid)+";color:black");
	//panel_head.attr("style", "");
	var button_group = panel_head.append("div").attr("class", "btn-group pull-right");

	button_group.append("button").attr("class", "btn btn-default")
		.on("click", function() {add_selected_keyword( kid); })
		.append('span').attr('class', 'glyphicon glyphicon-plus').attr("aria-hidden", "true");

	button_group.append("button").attr("class", "btn btn-default")
		.on("click", function() {remove_selected_keyword( kid); })
		.append('span').attr('class', 'glyphicon glyphicon-minus').attr("aria-hidden", "true");

	button_group.append("button").attr("class", "btn btn-default")
		.on("click", function() { delete_keyword_panel( kid ) } )
		.append('span').attr('class', 'glyphicon glyphicon-remove').attr("aria-hidden", "true");


	
	//.append("div").attr("class", "panel-body").text("Basic panel")

	keyword_add_dropdown( panel_body, kid, uid_list );
	var weibolist = weibolist_by_keyword( kid );
	//var userlist = keyword_to_users( kid );

	generate_weibo_in_panel( weibolist, panel_body, kid);

	
	$( "#keyword"+kid ).draggable();
}

function generate_weibo_in_panel(weibolist, panel_body, kid ) {
	d3.select(".panel_weibo#keyword"+kid).remove();

	var lists = panel_body.append("div").attr("class", "panel_weibo")
			.attr("style", "max-height: 500px; overflow: scroll")
			.attr("id", "keyword"+kid)
			.append("ul").attr("class", "list-group")
			.selectAll("li").data(weibolist)
		.enter().append("li")
			.attr("class", "list-group-item");
		//	.text(function (d) { return weibos[d]["text"]; });
		
	lists.attr("id","list"+kid).append('span').style("style", "font-size: bold").text( function (d) { 
			return weibos[d]["user"] + " [" + Timestamp(weibos[d]['time'])+ "] " ;} );
	lists.selectAll('span').data( function(d) { return weibotext_to_array(weibos[d]);} )
		.enter().append("span").attr("style", function(d) {return "color: "+d["color"]})
			.text(function (d) { return d["text"]; });
	lists.on("mouseover", function(d) {return keyword_mouseover_weibo(d); } )
		 .on("mouseout", function(d) {return keyword_mouseout_weibo(d); });
}

function Timestamp( t ) {
	var date = new Date( t * 1000 );

	return date.toLocaleDateString();
}

function add_selected_keyword( kid ) {
	var idx = keyword_selected_list.indexOf( kid );
	if (idx  === -1) {
		keyword_selected_list.push( kid );
		generate_graph_panel();
	}

}

function remove_selected_keyword( kid ) {	
	var idx = keyword_selected_list.indexOf( kid );
	if (idx > -1) {
		keyword_selected_list.splice(idx, 1);
		generate_graph_panel();
	}
}

function delete_keyword_panel( kid ) {
	d3.select(".panel#keyword"+kid ).remove();
	var idx = keyword_selected_list.indexOf( kid );
	if (idx > -1) {
		keyword_selected_list.splice(idx, 1);
		generate_graph_panel();
	}
//	remove_keyword_tag(index);

	//remove_keyword_tag( kid );
}

function delete_all_keyword_panel() {
	d3.selectAll(".panel.keypanel").remove();
	keyword_selected_list = [];
}

function weibotext_to_array( weibo ) {
	//return [weibo['text']];
	var ret = new Array(), j = 0;
	var post = weibo['post'], text = weibo['text'], key = weibo["keyword"];
	var pre = 0;
	for (var i = 0;i < post.length;++i) {
		if (i > 0 && post[i] < post[pre]+keywords[key[pre]]['word'].length)  
			continue;
		if (i == 0) {
			ret[j++] = {'text':text.substring(0, weibo['post'][i]), "color": "none" };
		}else {
			ret[j++] = {'text':text.substring(post[pre]+keywords[key[pre]]['word'].length, post[i]), "color": "none"};
		}
		ret[j++] = {'text':text.substring(post[i], post[i]+keywords[key[i]]['word'].length), "color": color_k(key[i])};		
		pre = i;
	}
	ret[j++] = {'text':text.substring(post[pre]+keywords[key[pre]]['word'].length, text.length), "color": "none"};		

	return ret;
}

function keyword_add_dropdown( panel, kid, uid_list ) {
	var dropdown = panel.append("div").attr("class", "dropdown");

	dropdown.append("button")
		.attr("class", "btn btn-default dropdown-toggle").attr("type", "button")
		.attr("data-toggle", "dropdown").attr("aria-expanded", "true").attr("id", "keyword"+kid)
		.text("All Users")
		.append("span").attr("class", "caret");

	var dropdownlist = dropdown.append("ul")
		.attr("class", "dropdown-menu").attr("role","menu").attr("aria-labelledby","dropdownMenu1");

	dropdownlist.append("li").attr("role", "presentation")
			.append("a").attr("class", "menuitem").attr("tabindex", "-1")
			.text( "All" )
			.on("mouseover", function(d) {return keyword_mouseover_user(kid, -1); } )
			.on("mouseout", function(d) {return keyword_mouseout_user(kid, -1); })
			.on("click", function() { change_button(kid, -1); } );

	dropdownlist.selectAll("li").data( uid_list )
		.enter().append("li")
			.attr("role", "presentation")
			.append("a").attr("class", "menuitem").attr("tabindex", "-1")
			.text( function(d) {return d; })
			.on("mouseover", function(d) {return keyword_mouseover_user(kid, d); } )
			.on("mouseout", function(d) {return keyword_mouseout_user(kid, d); })
			.on("click", function(d) { change_button(kid, d); });
}

function change_weibo(kid, uid) {
	var weibolist = d3.selectAll("#list"+kid);

	weibolist.style("display", function (d) { return (uid===-1 || uid === weibos[d]['user']) ? "block" : "none" ;});
}

function change_button(kid,  uid ) {
	if (selected_user >= 0) 
		removeRect( selected_user[kid] );
	selected_user[kid] = uid;
	change_weibo( kid, uid );
	d3.select(".dropdown-toggle#keyword"+kid).text(uid===-1? "All" : uid).append("span").attr("class", "caret");;

}

function keyword_mouseover_user( kid, uid ) {
	if (selected_user[kid] >= 0) {
		removeRect( selected_user[kid] );
		selected_user[kid] = -1;
	}
	if (uid < 0) return ;

	var weibolist = weibolist_by_user( uid );

	
	//console.log(weibolist);
	//console.log("over");
	addRect( weibolist );
}

function keyword_mouseout_user( kid, uid ) {
	if (uid != selected_user[kid]) 
		removeRect( uid );
	//console.log("out");

}

function keyword_mouseover_weibo( wid ) {
	//console.log( "w"+wid );

	hover_on_weibo( wid );
}

function keyword_mouseout_weibo( wid ) {
	hover_out_weibo( wid );

}