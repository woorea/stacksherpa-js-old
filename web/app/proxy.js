Proxy = function(url) {
	this.url = url || "http://localhost:8080/api"
}

Proxy.prototype.get = function(headers, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "GET",
		url : this.url,
		headers : headers,
		dataType: "json",
		success : success
	})
	
}

Proxy.prototype.post = function(headers, data, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "POST",
		url : this.url,
		headers : headers,
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify(data),
		dataType: "json",
		success : success
	})
	
}

Proxy.prototype.put = function(headers, data, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "PUT",
		url : this.url,
		headers : headers,
		contentType : "application/json; charset=UTF-8",
		data : JSON.stringify(data),
		dataType: "json",
		success : success
	})
	
}

Proxy.prototype.delete = function(headers, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "DELETE",
		url : this.url,
		headers : headers,
		dataType: "json",
		success : success
	})
	
}

Proxy.prototype.head = function(headers, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "HEAD",
		url : this.url,
		headers : headers,
		dataType: "json",
		success : success
	})
	
}

Proxy.prototype.options = function(headers, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "OPTIONS",
		url : this.url,
		headers : headers,
		dataType: "json",
		success : success
	})
	
}

Proxy.prototype.trace = function(headers, success) {
	
	$.ajax({
		//crossDomain: true,
		type : "TRACE",
		url : this.url,
		headers : headers,
		dataType: "json",
		success : success
	})
	
}

var proxy = new Proxy();