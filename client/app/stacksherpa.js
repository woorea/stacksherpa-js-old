var stacksherpa = {
	config : {
		proxy : null,
		providers : [
			{
				name : "devstack",
				title : "DevStack",
				version : "folsom",
				identity : {
					authentication : ["passwordCredentials"],
					endpoints : [
						"http://192.168.1.37:5000/v2.0"
					],
					admin_roles : ["KeystoneAdmin", "KeystoneServiceAdmin"]
				}
			},
			{
				name : "trystack",
				title : "TryStack",
				version : "essex",
				identity : {
					authentication : ["passwordCredentials"],
					endpoints : [
						"https://nova-api.trystack.org:5443"
					],
					admin_roles : []
				}
			},
			{
				name : "rackspace",
				title : "Rackspace",
				version : "essex",
				identity : {
					authentication : ["passwordCredentials", "RAX-KSKEY:apiKeyCredentials"],
					endpoints : [
						"https://identity.api.rackspacecloud.com/v2.0"
					],
					admin_roles : ["identity:user-admin"]
				}
			},
			{
				name : "hpcloud",
				title : "HPCloud",
				version : "diablo",
				identity : {
					authentication : ["passwordCredentials", "apiAccessKeyCredentials"],
					endpoints : [
						"https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0"
					],
					admin_roles : []
				}
			},
			{
				name : "custom",
				title : "Custom OpenStack Provider",
				version : "?",
				identity : {
					authentication : ["passwordCredentials", "jsonCredentials"],
					endpoints : [],
					admin_roles : []
				}
			}
		]
	}
}
