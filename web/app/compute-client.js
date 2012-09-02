Nova = function() {
	
}
Nova.prototype.listServers = function(success) {
	$.ajax({
		type : "GET",
		url : "data/servers/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listImages = function(success) {
	$.ajax({
		type : "GET",
		url : "data/images/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.showImage = function(data, success) {
	$.ajax({
		type : "GET",
		url : "data/images/show.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.showFlavor = function(data, success) {
	$.ajax({
		type : "GET",
		url : "data/flavors/show.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listFlavors = function(success) {
	$.ajax({
		type : "GET",
		url : "data/flavors/list.json",
		dataType: "json",
		success : success
	})
}

var nova = new Nova();