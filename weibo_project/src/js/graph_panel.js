function draw_graph_panel( ) {
	var panel = d3.select('#top-row').append("div").attr("class", "panel panel-success graphpanel");

	var panel_head = panel.append("div").attr("class", "panel-heading clearfix");
	var panel_body = panel.append("div").attr("class", "panel-body");

	panel_head.append("h4").attr("class", "panel-title pull-left").attr("id", "graph").text( selected_keyword_names() );
	panel_head.append("div").attr("class", "btn-group pull-right")
		.append("button").attr("class", "btn btn-default")
		.on("click", function() { delete_graph_panel(  ) } )
		.append('span').attr('class', 'glyphicon glyphicon-remove').attr("aria-hidden", "true");


	$( ".graphpanel" ).draggable({handle: ".panel-heading"});

	return panel_body;
	//.append("div").attr("class", "panel-body").text("Basic panel")

}

function selected_keyword_names() {
	ret = "";
	for (var i = 0;i < keyword_selected_list.length; ++i) {
		ret += keywords[ keyword_selected_list[i] ]["word"] +' '
	}
	return ret;
}

function delete_graph_panel(  ) {
	d3.select(".graphpanel" ).remove();
	keyword_selected_list = [];
}

function generate_graph_panel() {
	console.log( "generate_graph" );
	//delete_graph_panel();
	var dom;
	if (!d3.select(".panel.graphpanel").empty()) {
		dom = d3.select(".panel.graphpanel").select(".panel-body");
		d3.select("#related_graph").remove();
	}
	else dom = draw_graph_panel();

	console.log("paneltitle");

	d3.select(".panel-title#graph").text( selected_keyword_names() );

	var klist = selected_klist();

//	var data = graphdata_by_klist([10, 1]);
	console.log(graphdata_by_klist( klist ));

	force_graph(dom,400 * 0.9, 300 * 0.9, 20, graphdata_by_klist( klist ));
}