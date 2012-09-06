Nova = function(url, token) {
	this.url = url;
	this.token = token
}
Nova.prototype.get = function(path, success) {
	
	var headers = {
		"X-URI" : this.url + path,
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
}
Nova.prototype.post = function(path ,data, success) {
	
	var headers = {
		"X-URI" : this.url + path,
		"X-Auth-Token" : this.token.id
	}
	
	proxy.post(headers, data, success);
	
}

Nova.prototype.delete = function(path , success) {
	
	var headers = {
		"X-URI" : this.url + path,
		"X-Auth-Token" : this.token.id
	}
	
	proxy.delete(headers, data, success);
	
}


Nova.prototype.listServers = function(success) {
	
	var headers = {
		"X-URI" : this.url + "/servers",
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/servers/list.json",
		dataType: "json",
		success : success
	})
	*/
}

Nova.prototype.listImages = function(data, success) {
	
	var headers = {
		"X-URI" : this.url + "/images",
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/images/list.json",
		dataType: "json",
		success : success
	})
	*/
}

Nova.prototype.showImage = function(id, success) {
	
	var headers = {
		"X-URI" : this.url + "/images" + id,
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/images/show.json",
		dataType: "json",
		success : success
	})
	*/
}

Nova.prototype.showFlavor = function(id, success) {
	
	var headers = {
		"X-URI" : this.url + "/flavors" + id,
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/flavors/show.json",
		dataType: "json",
		success : success
	})
	*/
}

Nova.prototype.listFlavors = function(data, success) {
	
	var headers = {
		"X-URI" : this.url + "/flavors",
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/flavors/list.json",
		dataType: "json",
		success : success
	})
	*/
}

Nova.prototype.listFloatingIps = function(success) {
	
	var headers = {
		"X-URI" : this.url + "/os-floating-ips",
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/floatingips/list.json",
		dataType: "json",
		success : success
	})
	*/
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
	
	var headers = {
		"X-URI" : this.url + "/os-keypairs",
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/keypairs/list.json",
		dataType: "json",
		success : success
	})
	*/
}

Nova.prototype.listSecurityGroups = function(success) {
	
	var headers = {
		"X-URI" : this.url + "/os-security-groups",
		"X-Auth-Token" : this.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/nova/securitygroups/list.json",
		dataType: "json",
		success : success
	})
	*/
}

//var nova = new Nova();