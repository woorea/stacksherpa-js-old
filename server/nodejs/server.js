var fs = require('fs');
var urls = require('url');
var http = require('http');
var https = require('https');

var router = require('router');
var connect = require('connect');


var route = router();

route.all('/api', function(req, res) {
	
	res.setHeader("Access-Control-Allow-Origin", req.headers["origin"]);

	if(req.method == 'OPTIONS') {
		if(req.headers["access-control-request-headers"]) {
			res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
		}
		if(req.headers["access-control-request-method"]) {
			res.setHeader("Access-Control-Allow-Methods", req.headers["access-control-request-method"]);
		}
	}

	var xuri = req.headers["x-uri"];
	
	if(xuri) {
		
		var options = urls.parse(xuri);

		options.method = req.method
		options.headers = {
			"accept" : "application/json",
			"content-type" : req.headers["content-type"] || "application/json"
		}
		
		if(req.headers["x-auth-token"]) {
			options.headers["x-auth-token"] = req.headers["x-auth-token"];
		}
		
		var responseHandler = function(pres) {
			res.setHeader("Content-Type", pres.headers["content-type"]);
			
			pres.on("data", function(chunk) {
				res.write(chunk);
			});
			pres.on("end", function() {
				res.end();
			});
		}
		
		var preq
		if(options.protocol == 'http:') {
			preq = http.request(options, responseHandler);
		} else if (options.protocol == 'https:') {
			preq = https.request(options, responseHandler);
		}

		req.on("data", function(chunk) {
			preq.write(chunk);
		});

		req.on("end", function(chunk) {
			preq.end(chunk);
		});
	} else {
		res.end("");
	}
	
});

route.get('/swift/download', function(req, res) {
	
	var cookie = req.cookies['X-Auth-Token'];
	
	var options = urls.parse(req.url, true);
	
	var swiftObjectURL = options.query.url;
	
	var swiftObjectURLOptions = urls.parse(swiftObjectURL);
	
	swiftObjectURLOptions.headers = {
		"x-auth-token" : cookie
	};
	
	var responseHandler = function(pres) {
		
		res.setHeader("Content-disposition", "attachment; filename="+options.query.filename);
		
		res.setHeader("Content-Type", pres.headers["content-type"]);
		
		pres.on("data", function(chunk) {
			res.write(chunk);
		});
		pres.on("end", function() {
			res.end();
		});
	}
	
	var preq
	if(swiftObjectURLOptions.protocol == 'http:') {
		preq = http.request(swiftObjectURLOptions, responseHandler);
	} else if (swiftObjectURLOptions.protocol == 'https:') {
		preq = https.request(swiftObjectURLOptions, responseHandler);
	}
	
	req.on("data", function(chunk) {
		preq.write(chunk);
	});

	req.on("end", function(chunk) {
		preq.end(chunk);
	});
	
});

var app = connect()
	.use(connect.cookieParser())
	.use(connect.static('../../client'))
	.use(route);


var secure = true

if(secure) {
	var credentials = {
		key : fs.readFileSync('../../../private_key.pem').toString(),
		cert : fs.readFileSync('../../certs/certificate.pem').toString()
	};

	https.createServer(credentials, app).listen(9876);

} else {
	http.createServer(app).listen(9876);
}
