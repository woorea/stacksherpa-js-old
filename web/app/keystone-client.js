Keystone = function(url) {
	this.url = url
}
Keystone.prototype.login = function(auth, success) {
	
	/*
	$.ajax({
		type : "GET",
		url : "data/keystone/unscoped.json",
		dataType: "json",
		success : success
	})
	*/
	
	var headers = {
		"X-URI" : this.url + "/tokens"
	}
	
	if(this.access) {
		headers["X-Auth-Token"] = this.access.token.id
	}
	
	var that = this;
	
	proxy.post(headers, {auth : auth}, function(data) {
		that.access = data.access;
		success.call(undefined, data);
	});
	
}

Keystone.prototype.listTenants = function(success) {
	
	var headers = {
		"X-URI" : this.url + "/tenants"
	}
	
	if(this.access) {
		headers["X-Auth-Token"] = this.access.token.id
	}
	
	proxy.get(headers, success);
	
	/*
	$.ajax({
		type : "GET",
		url : "data/keystone/tenants.json",
		dataType: "json",
		success : success
	})
	*/
}

Keystone.prototype.listUsers = function(success) {
	$.ajax({
		type : "GET",
		url : "data/keystone/users.json",
		dataType: "json",
		success : success
	})
}

Keystone.prototype.listRoles = function(success) {
	$.ajax({
		type : "GET",
		url : "data/keystone/roles.json",
		dataType: "json",
		success : success
	})
}

Keystone.prototype.listServices = function(success) {
	$.ajax({
		type : "GET",
		url : "data/keystone/services.json",
		dataType: "json",
		success : success
	})
}

Keystone.prototype.listEndpoints = function(success) {
	$.ajax({
		type : "GET",
		url : "data/keystone/endpoints.json",
		dataType: "json",
		success : success
	})
}

var keystone = new Keystone("http://192.168.1.38:5000/v2.0");