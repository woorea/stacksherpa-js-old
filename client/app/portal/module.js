var portal = angular.module("portal",["ss.ui","openstack",,"compute","identity","storage"]);
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
		.when("/:tenant/dashboard", {controller : "TenantCtrl", templateUrl : "app/portal/views/tenant.html"})
		.when("/404", {templateUrl : "app/portal/views/404.html"})
		.otherwise({controller : "OtherwiseCtrl", template : "<br />"})
});
portal.run(function($rootScope, $window, $location, OpenStack) {
	
	var reloaded = OpenStack.reload();
	
	if(reloaded) {
		$rootScope.isLoggedIn = true;
	} else {
		$location.path("/login");
	}
	
	$rootScope.logout = function() {
		OpenStack.logout();
		$rootScope.isLoggedIn = false;
	}
	
	$rootScope.$on('$viewContentLoaded', function(event) {
		//$window._gaq.push(['_trackPageview', $location.path()]);
	});
	
});
portal.controller("StackSherpaCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.$routeParams = $routeParams;
	
	if($scope.$root.isLoggedIn) {
		
		$scope.access = OpenStack.getAccess();
		
		$scope.provider = OpenStack.getProvider();

		$scope.main_menu = []

		if($routeParams.tenant) {
			$scope.isKeystoneAdmin = _.intersection(
				_.pluck($scope.access.user.roles, 'name'),
				$scope.provider.identity.admin_roles
			).length > 0

			if($scope.isKeystoneAdmin) {
				$scope.main_menu.push({
					name : "Identity",
					type : "identity",
					endpoints : [
						{ region : $scope.provider.title }
					]
				});
			}

			angular.forEach($scope.access.serviceCatalog, function(service) {
				//check if this is a real openstack service
				if(_.include(['compute','object-store'], service.type) && service.endpoints[0].region) {
					$scope.main_menu.push(service);
				}
			});
			
			$scope.services = OpenStack.services;
		}

		$scope.onLogout = function() {
			$location.path("/")
		}

	}

	
});
portal.controller("LoginCtrl",function($scope, $location, OpenStack) {
	
	$scope.logout();
	
	$scope.providers = stacksherpa.config.providers;
	
	$scope.$watch('provider', function() {
		if($scope.provider.identity.endpoints.length) {
			$scope.endpoint = $scope.provider.identity.endpoints[0].publicURL;
		} else {
			$scope.endpoint = ""
		}
		$scope.authentication = $scope.provider.identity.authentication[0];
		$scope.auth = {
			passwordCredentials : {
				passwordCredentials : {
					username : "",
					password : ""
				}
			},
			apiAccessKeyCredentials : {
				apiAccessKeyCredentials : {
					accessKey : "",
					secretKey : ""
				}
			},
			"RAX-KSKEY:apiKeyCredentials" : {
				"RAX-KSKEY:apiKeyCredentials" : {
					username : "",
					apiKey : ""
				}
			},
			"jsonCredentials" : ""
		}
	});
	
	$scope.provider = $scope.providers[0];
	
	$scope.onLogin = function() {
		OpenStack.setProvider($scope.provider);
		OpenStack.authenticate({auth : $scope.auth[$scope.authentication]});
	}
	
	OpenStack.on('access', function() {
		$scope.$root.isLoggedIn = true;
		$location.path("/unscoped");
	});
	
});
portal.controller("UnscopedCtrl",function($scope, $location, OpenStack) {

	$scope.onTenantSelected = function(tenant) {
		OpenStack.authenticate({ auth : {
			token : {
				id : OpenStack.getAccess().token.id
			},
			tenantName : tenant.name
		}})
	}
	
	$scope.onRefresh = function(sync) {
		OpenStack.listTenants({refresh : sync});
	}
	
	OpenStack.on('tenants', function(tenants) {
		$scope.tenants = tenants;
	});
	
	OpenStack.on('access', function(access) {
		if(access.token.tenant) { //is a scoped token
			$.cookie("X-Auth-Token", access.token.id);
			$location.path("/" + access.token.tenant.name + "/dashboard");
		}
	})
	
	$scope.onRefresh(true);

});
portal.controller("TenantCtrl",function($scope, OpenStack) {
	
	OpenStack.services = {}
	
	angular.forEach(OpenStack.getAccess().serviceCatalog, function(service) {
		//check if this is a real openstack service
		if(service.endpoints[0].region) {
			OpenStack.services[service.type] = service;
		}
	});
	
	$scope.isKeystoneAdmin = _.intersection(
		_.pluck(OpenStack.getAccess().user.roles, 'name'),
		OpenStack.getProvider().identity.admin_roles
	).length > 0
	
	$scope.services = OpenStack.services;
	
});

portal.controller("MyAccountCtrl",function($scope, OpenStack) {
	
});

portal.controller("portal.UserListCtrl",function($scope, OpenStack) {
	
});

portal.controller("UsageCtrl",function($scope, OpenStack) {
	
});

portal.controller("BillingCtrl",function($scope, OpenStack) {
	
});

portal.controller("OtherwiseCtrl",function($scope, $location, OpenStack) {
	if($scope.isLoggedIn) {
		$location.path("/unscoped");
	} else {
		$location.path("/login");
	}
});
