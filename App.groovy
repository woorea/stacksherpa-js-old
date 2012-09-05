def eb = vertx.eventBus

//this handler will proxy all message as rest requests


//def restClient = vertx.createHttpClient()

def restHandler = { message ->
	
	println message
	println "Received message ${message.body.endpoint}"
	
	def restClient = vertx.createHttpClient(host: "localhost", port : 8080)
	
	def request = restClient.request(message.body.method, message.body.endpoint) { resp ->
	    //Beware of doing this with very large responses since the entire response body will be stored in memory.
		resp.bodyHandler { body ->
			println body.toString()
			println "The total body received was ${body.length} bytes"
			message.reply([json : body.toString()])
		}
		
	}
	request.end()
	
}

def restBroadcastHandler = { message ->
	
	println message
	println "Received message ${message.body.endpoint}" 
	
	def request = restClient.request(message.body.method, message.body.endpoint) { resp ->
	    //Beware of doing this with very large responses since the entire response body will be stored in memory.
		resp.bodyHandler { body ->
			println body.toString()
			println "The total body received was ${body.length} bytes"
			eb.publish("rest-broadcast-response", [json : body.toString()])
		}
		
	}
	request.end()
	
}

eb.registerHandler("rest-request", restHandler)
eb.registerHandler("rest-broadcast-request", restBroadcastHandler)

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
	deployModule('rest-proxy')
	deployModule('ws-server')
}
println "App started!"
