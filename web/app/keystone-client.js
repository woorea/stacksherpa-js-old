Keystone = function(url) {
	this.url = url
}
Keystone.prototype.login = function(auth, success) {
	/*
	$.ajax({
		type : "OPTIONS",
		url : "http://localhost:8080/openstack-http/proxy/options",
		success : function(data) {
			alert("success");
		}
	})
	*/
	$.ajax({
		crossDomain: true,
		type : "POST",
		url : "http://localhost:8080/cors-proxy/CorsServletProxy",
		headers : {
			"X-URL" : "/tokens"
		},
		data : auth,
		dataType: "json",
		success : success
	})
}

Keystone.prototype.listTenants = function(success) {
	
}

Keystone.prototype.listUsers = function(success) {
	
}

Keystone.prototype.listRoles = function(success) {
	
}

Keystone.prototype.listServices = function(success) {
	
}

Keystone.prototype.listEndpoints = function(success) {
	
}

var keystone = new Keystone("http://192.168.1.40:5000/v2.0");
keystone.login('{"auth" : {"passwordCredentials":{"username":"demo", password:"secret0"}}}', function(data) {
	/*
	$.ajax({
		crossDomain: true,
		type : "GET",
		url : "http://localhost:8080/cors-proxy/CorsServletProxy",
		headers : {
			"X-URL" : "/tenants",
			"X-Auth-Token" : data.access.token.id
		},
		dataType: "json",
		success : function(data) {
			//alert(data);
		}
	})
	*/
});