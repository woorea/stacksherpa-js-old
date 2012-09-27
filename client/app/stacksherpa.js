//iPad & iPhone fix
$('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { e.stopPropagation(); });
var stacksherpa = {
	config : {
		proxy : null,
		providers : [
			{
				name : "stacksherpa",
				title : "StackSherpa",
				version : "folsom",
				identity : {
					authentication : ["passwordCredentials"],
					endpoints : [
						{ 
							publicURL : "http://stacksherpa.com:5000/v2.0",
							adminURL : "http://stacksherpa.com:35357/v2.0"
						}
					],
					admin_roles : ["KeystoneAdmin", "KeystoneServiceAdmin"]
				}
			},
			{
				name : "devstack",
				title : "DevStack",
				version : "folsom",
				identity : {
					authentication : ["passwordCredentials"],
					endpoints : [
						{ 
							publicURL : "http://192.168.1.39:5000/v2.0",
							adminURL : "http://192.168.1.39:35357/v2.0"
						}
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
						{ 
							publicURL : "https://nova-api.trystack.org:5443",
							adminURL : "https://nova-api.trystack.org:5443"
						}
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
						{ 
							publicURL : "https://identity.api.rackspacecloud.com/v2.0",
							adminURL : "https://identity.api.rackspacecloud.com/v2.0"
						}
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
						{ 
							publicURL : "https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0",
							adminURL : "https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0"
						}
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
