def eb = vertx.eventBus

//this handler will proxy all message as rest requests
def restClient = vertx.createHttpClient(host: "localhost", port : 8080)

def restHandler = { message ->
	
	println message
	println "Received message ${message.body}"
	
	def request = restClient.request("GET", "/data/keystone/unscoped.json") { resp ->
	    //Beware of doing this with very large responses since the entire response body will be stored in memory.
		resp.bodyHandler { body ->
			println "The total body received was ${body.length} bytes"
			eb.publish("rest", [body : body.toString()])
		}
		
	}

	request.end()
	
}

eb.registerHandler("rest", restHandler)

println "EventBus started!"

def webServerConf = [
	port : 8080,
	host : '0.0.0.0',
	bridge : true,
	inbound_permitted : [
		[:]
	],
	outbound_permitted : [
		[:]
	]
]

container.with {
	deployModule('vertx.web-server-v1.0', webServerConf)
}
println "App started!"
