Nova = function() {
	
}
Nova.prototype.listServers = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/servers/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listImages = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/images/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.showImage = function(data, success) {
	$.ajax({
		type : "GET",
		url : "data/nova/images/show.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.showFlavor = function(data, success) {
	$.ajax({
		type : "GET",
		url : "data/nova/flavors/show.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listFlavors = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/flavors/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listFloatingIps = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/floatingips/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listVolumes = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/volumes/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listSnapshots = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/snapshots/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listKeyPairs = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/keypairs/list.json",
		dataType: "json",
		success : success
	})
}

Nova.prototype.listSecurityGroups = function(success) {
	$.ajax({
		type : "GET",
		url : "data/nova/securitygroups/list.json",
		dataType: "json",
		success : success
	})
}

var nova = new Nova();