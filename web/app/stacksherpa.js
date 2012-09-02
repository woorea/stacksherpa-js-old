var loggedin = false;

var stacksherpa = angular.module("stacksherpa",['ngResource'], function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/",{controller : "StackSherpaCtrl", templateUrl : "views/login.html"})
		
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

stacksherpa.factory('Tokens', function($resource) {
	var res = $resource('data/servers/list.json')
	//var res = $resource('http://localhost:8080/stacksherpa-http/proxy')
	return res;
});

stacksherpa.factory('Servers', function($resource) {
	var res = $resource('data/servers/list.json')
	//var res = $resource('http://localhost:8080/stacksherpa-proxy/proxy')
	console.log(res)
	return res;
});

stacksherpa.factory('Server', function($resource) {
	var res = $resource('data/servers/show.json')
	return res;
});

stacksherpa.factory('Flavors', function($resource) {
	var res = $resource('data/flavors/list.json')
	return res;
});

stacksherpa.factory('Flavor', function($resource) {
	var res = $resource('data/flavors/show.json')
	return res;
});

stacksherpa.factory('Images', function($resource) {
	var res = $resource('data/images/list.json')
	return res;
});

stacksherpa.factory('Image', function($resource) {
	var res = $resource('data/images/show.json')
	return res;
});

stacksherpa.controller("StackSherpaCtrl", function($scope, $location) {
	
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
	
	$scope.onLogin = function() {
		loggedin = true;
		$location.path("/projects/1")
	}
	
	$scope.onLogout = function() {
		loggedin = false;
		$location.path("/")
	}
	
	$scope.isLoggedIn = function() {
		return loggedin;
	}

})

stacksherpa.controller("ProjectCtrl", function($scope, $location) {
	
})