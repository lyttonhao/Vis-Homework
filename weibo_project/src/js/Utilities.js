//	

function time_in( T, time_start, time_end) {
	if (T >= time_start && T <= time_end) return true;
	else return false;
}

//generate keyword list by [time_start, time_end]
function keylist_by_time(  ) {
	console.log(time_start +' ' +time_end);
	var weight = new Array(keywords.length);
	var index = new Array(keywords.length);
	var ret = [];

	for (var i = 0;i < keywords.length;++i) {
		weight[i] = 0;
		for (var j = 0;j < keywords[i]['weibo'].length;++j)
			if (time_in(weibos[keywords[i]['weibo'][j]]['dayid'], time_start, time_end)) {
				weight[i]++;
			}
	}
	for (var i = 0;i < keywords.length;++i) {
		index[i] = i;
		weight[i] = weight[i] * weight[i] / keywords[i]['freq'];
		weight[i] *= keywords[i]["weight"];
	}
	index.sort( function(a, b) { return weight[a] > weight[b] ? -1 : 1 ;});
	for (var i = 0;i < kw_threshold;++i)
		ret.push( {"kid": index[i], "weight1": weight[index[i]]} );

	return ret;
}

//generate user weight by keyword
function userweight_by_key( kid ) {
	var v_user = new Array(users.length);
		console.log(kid);
	var kweibo = keywords[kid]['weibo'];

	for (var i = 0;i < users.length;++i) 
		v_user[i] = 0;
	for (var i = 0;i < kweibo.length;++i) {
		if (time_in(weibos[kweibo[i]]['dayid'], time_start, time_end)) {
			v_user[weibos[kweibo[i]]['user']]++;
		}
	}


	return v_user;
}

function topuser_by_key( kid ) {
	var v_user = userweight_by_key( kid );
	var index = new Array(users.length);
	var ret = new Array();

	for (var i = 0;i < users.length;++i) 
		index[i] = i;
	index.sort( function(a, b) { return v_user[a] > v_user[b] ? -1 : 1 ;});
	for (var i = 0;i < user_threshold;++i) {
		if (v_user[ index[i] ] <= 0) 
			break;
		ret.push( index[i] );
	}
	return ret;
}


function graphdata_by_klist( klist ) {
//	"nodes": ["names": "k/uid"]
//	"edge": ["source", "target", "weight"]
	var selected_user = new Array( users.length );
	var key_users = new Array( klist.length );
	var index = new Array(users.length);
	var ret = {"nodes": [], "edges": []};

	for (var i = 0;i < users.length;++i) 
		selected_user[i] = false;
	for (var i = 0;i < klist.length;++i) {
		ret["nodes"].push( {"name": "k"+klist[i], "weight1": 0} );
		key_users[i] = userweight_by_key( klist[i] );
		for (var j = 0;j < users.length;++j) 
			index[j] = j;
		index.sort( function(a, b) { return key_users[i][a] > key_users[i][b] ? -1 : 1 ;});
		for (var j = 0;j < user_threshold;++j) {
			if (key_users[i][ index[j] ]  <= 0)
				break;
			selected_user[ index[j] ] = true;
		}
	}
	var now = ret["nodes"].length;
	for (var i = 0;i < users.length;++i) 
		if (selected_user[i]) {
			ret["nodes"].push( {"name": "u"+i, "weight1": 0} );
			for (var j = 0;j < klist.length;++j) 
				if (key_users[j][i] > 0) {
					ret["edges"].push( {"source": j, "target": now, "weight1":key_users[j][i]} );
					ret["nodes"][j]["weight1"] += key_users[j][i];
					ret["nodes"][now]["weight1"] += key_users[j][i];
				}
			now++;
		}

	return ret;
}


//generate weibolist in [time_start, time_end] by userid
function weibolist_by_user( uid ) {
	var u = uid.toString();
	var ret = {};
	ret[u] = [];
	for (var i = users[uid]['wbstart'];i < weibos.length;++i)
		if (weibos[i]['user'] === uid){
			if (time_in(weibos[i]['dayid'], time_start, time_end))
				ret[u].push( i );
		} 
		else break;

	return ret;
}

//generate keywordlist in [time_start, time_end] by user_id
function keywordlist_by_user( uid ) {
	var ret = new Array();
	
	for (var i = 0;i < users[uid]["keyword"].length;++i){
		kid = users[uid]["keyword"][i];
		for (var j = 0;j < keywords[kid]['time'].length;++j)
			if (time_in(keywords[i]['time'][j], time_start, time_end)) {
				ret.push( kid );
				break;
			}
	}

	return ret.slice(0, kw_threshold);
}

function selected_klist() {

	return keyword_selected_list;
	/*
	var klist = keylist_by_time();
	var ret = [];

	for (var i = 0;i < klist.length;++i) 
		if (!d3.select("#keyword" + klist[i]).empty() ){
			ret.push( klist[i] );
		}
	console.log(ret);

	return ret;
	*/
}

function weibolist_by_keyword( kid ) {
	var wlist = keywords[kid]["weibo"];
	var ret = [];
	//var 
	for (var i = 0;i < wlist.length;++i) 
		if (time_in(weibos[wlist[i]]["dayid"], time_start, time_end))
			ret.push( wlist[i] );

	ret.sort( function(a, b) { return weibos[a]['time'] < weibos[b]['time'] ? -1 : 1 ;});
	return ret;

}


function weibo_num_by_day() {
	var num = new Array( days );

	for (var i = 0;i < days;++i)
		num[i] = 0;

	for (var i = 0;i < weibos.length;++i)
		++num[ weibos[i]["dayid"] ];

	return num;
}


function weibo_num_by_keyword( kid ) {
	var num = new Array( days );
	var wlist = keywords[kid]["weibo"];

	for (var i = 0;i < days;++i)
		num[i] = 0;

	for (var i = 0;i < wlist.length;++i)
		++num[ weibos[wlist[i]]["dayid"] ];

	return num;
}


