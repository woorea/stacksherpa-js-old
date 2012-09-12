var portal = angular.module("portal",[]);
portal.config(function($routeProvider) {
	$routeProvider
		.when("/login", {controller : "LoginCtrl", templateUrl : "app/portal/views/login.html"})
		.when("/unscoped", {controller : "UnscopedCtrl", templateUrl : "app/portal/views/unscoped.html"})
		.when("/myaccount", {controller : "MyAccountCtrl", templateUrl : "app/portal/views/myaccount.html"})
		.when("/usage", {controller : "UsageCtrl", templateUrl : "app/portal/views/myusage.html"})
		.when("/usage/aggregate", {controller : "UsageCtrl", templateUrl : "app/portal/views/myusageaggregate.html"})
		.when("/billing", {controller : "BillingCtrl", templateUrl : "app/portal/views/billing.html"})
		.when("/billing/:id", {controller : "BillingCtrl", templateUrl : "app/portal/views/myinvoice.html"})
		.when("/admin/users", {controller : "UserListCtrl", templateUrl : "app/portal/views/admin/users/list.html"})
		.when("/:tenant", {controller : "TenantCtrl", templateUrl : "app/portal/views/tenant.html"})
		.otherwise({redirectTo : "/login"})
});
portal.controller("LoginCtrl",function($scope, $location, OpenStack) {
	$scope.providers = {
		openstack : {
			indentityURL : "http://192.168.1.37:5000/v2.0/",
			auth : {
				passwordCredentials : {
					username : "admin",
					password : "secret0"
				}
			}
		},
		hpcloud : {
			indentityURL : "https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/",
			auth : {
				apiAccessKeyCredentials : {
					accessKey : "",
					secretKey : ""
				}
			}
		}
	}
	
	$scope.selectedProvider = "openstack";
	
	$scope.onLogin = function() {
		var provider = $scope.providers[$scope.selectedProvider];
		OpenStack.identityURL = provider.indentityURL;
		OpenStack.ajax({
			method : "POST",
			url : OpenStack.identityURL + "/tokens",
			data : {auth : provider.auth}
		}).success(function(data, status, headers, config) {
			OpenStack.access = data.access;
			OpenStack.ajax({
				method : "GET",
				url : OpenStack.identityURL + "/tenants"
			}).success(function(data, status, headers, config) {
				OpenStack.tenants = data.tenants;
				$location.path("/unscoped");
			}).error(function(data, status, headers, config) {
			});
		}).error(function(data, status, headers, config) {
			alert(status);
		})
	}
});
portal.controller("UnscopedCtrl",function($scope, $location, OpenStack) {

	$scope.tenants = OpenStack.tenants

	$scope.onTenantSelected = function(tenant) {
		OpenStack.ajax({
			method : "POST",
			url : OpenStack.identityURL + "/tokens",
			data : { auth : {
				token : {
					id : OpenStack.access.token.id
				},
				tenantName : tenant.name
			}}
		}).success(function(data, status, headers, config) {
			OpenStack.access = data.access;
			$.cookie("X-Auth-Token", OpenStack.access.token.id);
			$location.path("/" + OpenStack.access.token.tenant.name);
		}).error(function(data, status, headers, config) {
			alert(status);
		})
	}

});
portal.controller("TenantCtrl",function($scope, OpenStack) {
	
	OpenStack.services = {}
	
	angular.forEach(OpenStack.access.serviceCatalog, function(service) {
		OpenStack.services[service.type] = service;
	});
	
	$scope.services = OpenStack.services;
	
});

portal.controller("MyAccountCtrl",function($scope, OpenStack) {
	
});

portal.controller("UserListCtrl",function($scope, OpenStack) {
	
});

portal.controller("UsageCtrl",function($scope, OpenStack) {
	
});

portal.controller("BillingCtrl",function($scope, OpenStack) {
	
});
