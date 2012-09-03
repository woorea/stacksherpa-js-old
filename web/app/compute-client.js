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

Nova.prototype.listFloatingIps = function(success) {
	$.ajax({
		type : "GET",
		url : "data/floatingips/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listVolumes = function(success) {
	$.ajax({
		type : "GET",
		url : "data/volumes/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listSnapshots = function(success) {
	$.ajax({
		type : "GET",
		url : "data/snapshots/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listKeyPairs = function(success) {
	$.ajax({
		type : "GET",
		url : "data/keypairs/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listSecurityGroups = function(success) {
	$.ajax({
		type : "GET",
		url : "data/securitygroups/list.json",
		dataType: "json",
		success : success
	})
}

var nova = new Nova();