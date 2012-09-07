var providers = {
	openstack : {
		identityEndpoint : "http://192.168.1.38:5000/v2.0",
		view : "views/login/openstack.html"
	},
	hpcloud : {
		identityEndpoint : "https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0",
		view : "views/login/hpcloud.html"
	}
}
var stacksherpa = angular.module("stacksherpa",['ngCookies'], function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/",{controller : "LoginCtrl", templateUrl : "views/login/layout.html"})
		
		.when("/unscoped-token",{controller : "UnscopedTokenCtrl", templateUrl : "views/portal/unscoped.html"})
		
		.when("/portal/myaccount",{controller : "PortalUserEditCtrl", templateUrl : "views/portal/layout.html"})
		.when("/portal/usage",{controller : "PortalUsageListCtrl", templateUrl : "views/portal/layout.html"})
		.when("/portal/usage/aggregate",{controller : "PortalUsageAggregateListCtrl", templateUrl : "views/portal/layout.html"})
		.when("/portal/billing",{controller : "PortalBillingListCtrl", templateUrl : "views/portal/layout.html"})
		.when("/portal/billing/:invoiceId",{controller : "PortalBillingShowCtrl", templateUrl : "views/portal/layout.html"})
		
		.when("/identity/tenants",{controller : "TenantListCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/tenants/:tenantId",{controller : "TenantShowCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/users",{controller : "UserListCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/users/:userId",{controller : "UserShowCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/roles",{controller : "RoleListCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/roles/:roleId",{controller : "RoleShowCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/services",{controller : "ServiceListCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/services/:serviceId",{controller : "ServiceShowCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/endpoints",{controller : "EndpointListCtrl", templateUrl : "views/identity/layout.html"})
		.when("/identity/endpoints/:endpointId",{controller : "EndpointShowCtrl", templateUrl : "views/identity/layout.html"})
		
		.when("/projects/:projectId",{controller : "ProjectCtrl", templateUrl : "views/dashboard/project.html"})
		.when("/projects/:projectId/region/:regionName/servers",{controller : "ServerListCtrl", templateUrl : "views/compute/layout.html"})
		
		.when("/servers/:serverId",{controller : "ServerShowCtrl", templateUrl : "views/compute/layout.html"})
		.when("/images",{controller : "ImageListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/images/:imageId",{controller : "ImageShowCtrl", templateUrl : "views/compute/layout.html"})
		.when("/flavors",{controller : "FlavorListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/flavors/:flavorId",{controller : "FlavorShowCtrl", templateUrl : "views/compute/layout.html"})
		.when("/floating-ips",{controller : "FloatingIpListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/volumes",{controller : "VolumeListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/volumes/:volumeId",{controller : "VolumeShowCtrl", templateUrl : "views/compute/layout.html"})
		.when("/snapshots",{controller : "SnapshotListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/key-pairs",{controller : "KeyPairListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/security-groups",{controller : "SecurityGroupListCtrl", templateUrl : "views/compute/layout.html"})
		.when("/security-groups/:securityGroupId",{controller : "SecurityGroupEditCtrl", templateUrl : "views/compute/layout.html"})
		
		.when("/projects/:projectId/region/:regionName/storage/containers",{controller : "ContainerListCtrl", templateUrl : "views/storage/layout.html"})
		.when("/projects/:projectId/region/:regionName/storage/containers/:containerName",{controller : "ContainerShowCtrl", templateUrl : "views/storage/layout.html"})
		
		.otherwise({redirectTo : "/"})
})

stacksherpa.factory("eb", function($rootScope) {
	
	var eb;
	
	function init() {
		
		eb = new vertx.EventBus("http://localhost:8080/eventbus");

		eb.onopen = function() {
			
			eb.registerHandler('rest-broadcast-response', function(message) {

				//message handler field to match $scope.$on(message.handler. fn)
				//in controllers that match
				//$rootScope.$broadcast(message.handler, message)

				console.log(eval( "(" + message.json + ")" ));

			});
			
			//alert('eventbus-onopen');
			
		};

		eb.onclose = function() {
			//alert('eventbus-onclose');
			eb = null;
		};
		
	}
	
	//working, but not enabled yet
	//init()
	
	return eb;
	
});

String.prototype.startsWith = function(prefix) {
    return(this.indexOf(prefix) == 0);
};

stacksherpa.controller("StackSherpaCtrl", function($scope, $location, $cookieStore, eb) {
	
	$scope.modal = ''
	
	var bindServices = function() {
		var access = $cookieStore.get("access")
		if(access && angular.isArray(access.serviceCatalog)) {
			$scope.compute = access.serviceCatalog.filter(function(service) {
				return service.type == 'compute'
			})[0];
			$scope.storage = access.serviceCatalog.filter(function(service) {
				return service.type == 'object-store'
			})[0];
			
			$scope.tenantId = access.token.tenant.id

			$scope.isKeystoneAdmin = access.user.roles.filter(function(role){
				return role.name == 'KeystoneAdmin'
			}).length > 0;

			if($scope.isKeystoneAdmin) {
				$scope.identity = access.serviceCatalog.filter(function(service) {
					return service.type == 'identity'
				})[0]
			}
		}
	} 
	
	$scope.$on('login', function(event, args) {
		bindServices();
	})

	$scope.$on('modal.show', function(event, args) {
		$scope.modal = args.view
	})
	
	$scope.$on('modal.hide', function(event, args) {
		$scope.modal = ''
	})
	
	$scope.onCloseModal = function() {
		$scope.modal = ''
	}
	
	$scope.onLogout = function() {
		$cookieStore.remove("access")
		$location.path("/")
	}
	
	$scope.isLoggedIn = function() {
		var access = $cookieStore.get("access");
		return access != null;
	}

	bindServices();
})

stacksherpa.controller("LoginCtrl", function($scope, $location, $cookieStore, eb) {
	
	$cookieStore.remove("access")
	
	$scope.providers = providers
	
	$scope.provider = "openstack"
	
	$scope.username = "demo"
	$scope.password = "secret0"
	
	$scope.accessKey = ""
	$scope.secretKey = ""
	
	var callback = function(data) {
		$cookieStore.put("access", data.access)
		keystone.listTenants(function(data) {
			$cookieStore.put("tenants", data.tenants);
			
			$location.path("/unscoped-token");
			$scope.$apply();
		});
	}
	
	
	$scope.onHPCloudLogin = function() {
		window.keystone = new Keystone($scope.providers[$scope.provider].identityEndpoint);
		keystone.login({
			apiAccessKeyCredentials : {
				accessKey : $scope.accessKey,
				secretKey : $scope.secretKey
			}
		}, callback);
	}
	
	$scope.onLogin = function() {
		
		window.keystone = new Keystone($scope.providers[$scope.provider].identityEndpoint);
		
		keystone.login({
			passwordCredentials : {
				username : "admin",
				password : "secret0"
			}
		}, callback);
		
		/*
		if(eb) {
			
			eb.send("rest-request", {
				endpoint : '/data/keystone/unscoped.json',
				method : "POST",
				headers : [],
				payload : {
					auth : {
						passwordCredentials : {
							username : $scope.username,
							password : $scope.password
						}
					}
				}
			}, function(reply) {
				//alert(eval( "(" + reply.json + ")" ));
				alert(reply.json)
			});
			
		}
		*/

	}
	
});

stacksherpa.controller("UnscopedTokenCtrl", function($rootScope, $scope, $location, $cookieStore) {
	
	$scope.tenants = $cookieStore.get("tenants");
	
	var callback = function(data) {
		$cookieStore.put("access", data.access)
		$location.path("/projects/" + data.access.token.tenant.id)
		$rootScope.$broadcast('login');
		$scope.$apply();
	}
	
	$scope.onTenantSelected = function(tenant) {
		var access = $cookieStore.get("access")
		keystone.login({
			token : {
				id : access.token.id
			},
			tenantId : tenant.id
		}, callback);
	}
	
	/*
	if($scope.tenants == null) {
		keystone.listTenants(function(data) {
			$scope.tenants = data.tenants
			$cookieStore.put("tenants", data.tenants)
		});
	}
	*/

})

stacksherpa.controller("ProjectCtrl", function($scope, $location, $cookieStore) {
	
	$scope.onRegionSelected = function(endpoint, location) {
		window.nova = new Nova(endpoint.publicURL, keystone.access.token)
		$location.path(location)
	}
	
})