/*
def eb = vertx.eventBus

def handler = { message ->
	println message
	println "Received message ${message.body}"
}

eb.registerHandler("keystone", handler)

def webServerConf = [
	port : 8080,
	host : '0.0.0.0',
	bridge : true,
	inbound_permitted : [
		[address : 'keystone']
	],
	outbound_permitted : [
		[:]
	]
]
*/

def webServerConf = [
	port : 8080,
	host : '0.0.0.0'
]

container.with {
	deployModule('vertx.web-server-v1.0', webServerConf)
}

