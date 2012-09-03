Swift = function() {
	
}
Swift.prototype.listContainers = function(success) {
	$.ajax({
		type : "GET",
		url : "data/swift/containers.json",
		dataType: "json",
		success : success
	})
}
Swift.prototype.listObjects = function(success) {
	$.ajax({
		type : "GET",
		url : "data/swift/objects.json",
		dataType: "json",
		success : success
	})
}

var swift = new Swift()