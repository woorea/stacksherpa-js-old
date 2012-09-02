Nova = function() {
	
}
Nova.prototype.listImages = function(success) {
	$.ajax({
		type : "GET",
		url : "data/images/list.json",
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