var stacksherpa = angular.module("stacksherpa",['ngCookies'], function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/",{controller : "LoginCtrl", templateUrl : "views/login.html"})
		
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
		.when("/security-groups/:securityGroupId",{controller : "SecurityGroupShowCtrl", templateUrl : "views/compute/layout.html"})
		
		.otherwise({redirectTo : "/"})
})

String.prototype.startsWith = function(prefix) {
    return(this.indexOf(prefix) == 0);
};

stacksherpa.controller("StackSherpaCtrl", function($scope, $location, $cookieStore) {
	
	$scope.modal = ''

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
	
	//dirty
	var access = $cookieStore.get("access")
	if(access) {
		$scope.compute = access.serviceCatalog.filter(function(service) {
			return service.type == 'compute'
		})[0]
	}

})

stacksherpa.controller("LoginCtrl", function($scope, $location, $cookieStore) {
	
	$cookieStore.remove("access")
	
	$scope.onLogin = function() {
		
		keystone.login({
			auth : {
				passwordCredentials : {
					username : $scope.username,
					password : $scope.password
				}
			}
		}, function(data) {
			$cookieStore.put("access", data.access)
			keystone.listTenants(function(data) {
				$cookieStore.put("tenants", data.tenants);
				
				$location.path("/unscoped-token");
				$scope.$apply();
			});	
		});
	}

});

stacksherpa.controller("UnscopedTokenCtrl", function($scope, $location, $cookieStore) {
	
	$scope.tenants = $cookieStore.get("tenants");
	
	$scope.onTenantSelected = function(tenant) {
		keystone.exchangeToken(function(data) {
			$cookieStore.put("access", data.access)
			$location.path("/projects/" + tenant.id)
			$scope.$apply();
		});
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
	
	var access = $cookieStore.get("access")
	
	$scope.tenantId = access.token.tenant.id
	
	$scope.isKeystoneAdmin = access.user.roles.filter(function(role){
		return role.name == 'KeystoneAdmin'
	}).length > 0;
	
	if($scope.isKeystoneAdmin) {
		$scope.identity = access.serviceCatalog.filter(function(service) {
			return service.type == 'identity'
		})[0]
	}
	/* see stacksherpactrl
	$scope.compute = access.serviceCatalog.filter(function(service) {
		return service.type == 'compute'
	})[0]
	*/
	$scope.storage = access.serviceCatalog.filter(function(service) {
		return service.type == 'object-store'
	})[0]
	
})