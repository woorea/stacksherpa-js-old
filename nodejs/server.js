var http = require('http');
var url = require('url');

http.createServer(function(req, res) {
	
	res.setHeader("Access-Control-Allow-Origin", req.headers["origin"]);
	
	if(req.method == "OPTIONS") {
		if(req.headers["access-control-request-headers"]) {
			res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
		}
		if(req.headers["access-control-request-method"]) {
			res.setHeader("Access-Control-Allow-Methods", req.headers["access-control-request-method"]);
		}
	}

	var xuri = req.headers["x-uri"];
	
	if(xuri) {
		var options = url.parse(xuri);

		options.method = req.method
		options.headers = {
			"x-auth-token" : req.headers["x-auth-token"],
			"accept" : "application/json",
			"content-type" : req.headers["content-type"] || "application/json"
		}
		
		var preq = http.request(options, function(pres) {
			
			res.setHeader("Content-Type", pres.headers["content-type"]);
			
			pres.on("data", function(chunk) {
				res.write(chunk);
			});
			pres.on("end", function() {
				res.end();
			});
		});

		req.on("data", function(chunk) {
			preq.write(chunk);
		});

		req.on("end", function(chunk) {
			preq.end(chunk);
		});
	} else {
		res.end("");
	}
	
}).listen(7070);
