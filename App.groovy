def webServerConf = [
	port : 8080,
	host : 'localhost'//,
	/*
	bridge : true,
	inbound_permitted : [
		[
			address : 'vertx.mongopersistor',
			match : [
				action : "find",
				collection : "albums"
			]
		]
	],
	outbound_permitted : [
		[:]
	]
	*/
]

container.with {
	/*
	deployModule('vertx.mongo-persistor-v1.0') {
		deployVerticle('StaticData.groovy')
	}
	*/
	deployModule('vertx.web-server-v1.0', webServerConf)
	
}

