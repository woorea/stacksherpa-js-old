String.prototype.startsWith = function(prefix) {
    return(this.indexOf(prefix) == 0);
};

var compute = angular.module("stacksherpa-compute",['ngCookies'], function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/:tenantId/:regionName/servers",{controller : "ServerListCtrl", templateUrl : "views/servers/list.html"})
		.when("/:tenantId/:regionName/servers/:serverId",{controller : "ServerShowCtrl", templateUrl : "views/servers/show.html"})
		.when("/:tenantId/:regionName/images",{controller : "ImageListCtrl", templateUrl : "views/images/list.html"})
		.when("/:tenantId/:regionName/images/:imageId",{controller : "ImageShowCtrl", templateUrl : "views/images/show.html"})
		.when("/:tenantId/:regionName/flavors",{controller : "FlavorListCtrl", templateUrl : "views/flavors/list.html"})
		.when("/:tenantId/:regionName/flavors/:flavorId",{controller : "FlavorShowCtrl", templateUrl : "views/flavors/show.html"})
		.when("/:tenantId/:regionName/floating-ips",{controller : "FloatingIpListCtrl", templateUrl : "views/floatingips/list.html"})
		.when("/:tenantId/:regionName/volumes",{controller : "VolumeListCtrl", templateUrl : "views/volumes/list.html"})
		.when("/:tenantId/:regionName/volumes/:volumeId",{controller : "VolumeShowCtrl", templateUrl : "views/volumes/show.html"})
		.when("/:tenantId/:regionName/snapshots",{controller : "SnapshotListCtrl", templateUrl : "views/snapshots/list.html"})
		.when("/:tenantId/:regionName/key-pairs",{controller : "KeyPairListCtrl", templateUrl : "views/keypairs/list.html"})
		.when("/:tenantId/:regionName/security-groups",{controller : "SecurityGroupListCtrl", templateUrl : "views/securitygroups/list.html"})
		.when("/:tenantId/:regionName/security-groups/:securityGroupId",{controller : "SecurityGroupEditCtrl", templateUrl : "views/securitygroups/show.html"})
		//.otherwise({redirectTo : "/servers"})
});
compute.factory('nova', function($location, $cookieStore) {
	
	var pathItems = $location.path().split('/');
	
	if(pathItems.length > 2) {
	
		var access = $cookieStore.get("access");
	
		var compute = access.serviceCatalog.filter(function(service) {
			return service.type == 'compute'
		})[0];
	
		var endpoint = compute.endpoints.filter(function(endpoint) {
			return endpoint.region == pathItems[2]
		})[0].publicURL;
	
		return new Nova(endpoint, access.token)
	} else {
		alert('error');
	}
	
});

compute.controller("ComputeCtrl", function($scope, $location, $cookieStore) {
	
	//routeParams may be not accessible on contructor
	//TODO: fix this code and nova service
	
	var pathItems = $location.path().split('/');
	
	if(pathItems.length > 2) {
		
		var access = $cookieStore.get("access");
		
		$scope.compute = access.serviceCatalog.filter(function(service) {
			return service.type == 'compute'
		})[0];
		
		$scope.tenantId = pathItems[1]
		$scope.regionName = pathItems[2]
	} else {
		alert('error');
	}

});