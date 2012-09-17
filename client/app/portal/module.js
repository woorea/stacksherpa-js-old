var portal = angular.module("portal",["openstack","common.file-upload","compute","identity","storage"]);
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
portal.run(function($rootScope, $location, OpenStack) {
	
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
		$window._gaq.push(['_trackPageview', $location.path()]);
	});
	
});
portal.controller("StackSherpaCtrl", function($scope, $routeParams) {
	$scope.modal = '';
	
	
	//$scope.$location = $location;
	//$scope.$route = $route;
	$scope.$routeParams = $routeParams;
	
	$scope.onLogout = function() {
		$location.path("/")
	}
	
})
portal.directive('withSelectionCheckboxes', function() {
	return function(scope, element, attrs) {

		scope.checkAll = function() {
			var items = scope[attrs.withSelectionCheckboxes];
			console.log(items);
			angular.forEach(items, function(item) {
				item.checked = scope.checkedAll;
			});
		}

		scope.allChecked = function() {
			var items = scope[attrs.withSelectionCheckboxes];
			if(items && items.length) {
				var isCheckedAll = true;
				angular.forEach(items, function(item) {
				    if (!item.checked) {
						isCheckedAll = false;
						return;
					}
				});
				return isCheckedAll;
			} else {
				return false;
			}
		};
	}
})
portal.directive('bootstrapModal', function($http, $templateCache, $compile) {
	
	return function(scope, element, attrs) {
		
		$modal = $('#modal');
		
		var modalScope;
		
		element.click(function() {
			
			if (modalScope) modalScope.$destroy();
			modalScope = scope.$new();
			
			var partial = attrs.bootstrapModal;
			
			//TODO: use $templateCache
			//$http.get(partial, {cache: $templateCache}).success(function(response) {
			$http.get(partial).success(function(response) {
				$modal.html(response);
				$compile($modal.contents())(modalScope);
			});
			//scope.$root.$broadcast('modal.show',{view : partial});
		});
		scope.onCloseModal = function() {
			$modal.html('');
		}
		scope.$on('modal.hide', function(event, args) {
			$modal.html('');
		})
	}
});
portal.controller("LoginCtrl",function($scope, $location, OpenStack) {
	
	$scope.logout();
	
	$scope.providers = {
		passwordCredentials : {
			indentityURL : "http://192.168.1.37:5000/v2.0",
			auth : {
				passwordCredentials : {
					username : "admin",
					password : "secret0"
				}
			}
		},
		apiAccessKeyCredentials : {
			indentityURL : "https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0",
			auth : {
				apiAccessKeyCredentials : {
					accessKey : "",
					secretKey : ""
				}
			}
		}
	}
	
	$scope.auth_methods = function() {
		return Object.keys($scope.providers);
	}
	
	$scope.selectedProvider = "passwordCredentials";
	
	$scope.onLogin = function() {
		var provider = $scope.providers[$scope.selectedProvider];
		OpenStack.ajax({
			method : "POST",
			url : provider.indentityURL + "/tokens",
			data : {auth : provider.auth}
		}).success(function(data, status, headers, config) {
			if(data.access) {
				$scope.$root.isLoggedIn = true;
				OpenStack.setAuthenticationURL(provider.indentityURL);
				OpenStack.setAccess(data.access);
				$location.path("/unscoped");
			} else {
				alert('UNAUTHORIZED : Invalid credentials');
			}
		}).error(function(data, status, headers, config) {
			alert(status);
		})
	}
	
});
portal.controller("UnscopedCtrl",function($scope, $location, OpenStack) {

	$scope.onTenantSelected = function(tenant) {
		OpenStack.ajax({
			method : "POST",
			url : OpenStack.getAuthenticationURL() + "/tokens",
			data : { auth : {
				token : {
					id : OpenStack.getAccess().token.id
				},
				tenantName : tenant.name
			}}
		}).success(function(data, status, headers, config) {
			OpenStack.setAccess(data.access);
			$.cookie("X-Auth-Token", data.access.token.id);
			$location.path("/" + tenant.name + "/dashboard");
		}).error(function(data, status, headers, config) {
			alert(status);
		})
	}
	
	OpenStack.ajax({
		method : "GET",
		url : OpenStack.getAuthenticationURL() + "/tenants",
		refresh : true
	}).success(function(data, status, headers, config) {
		if(!angular.isArray(data.tenants)) {
			//weird json from trystack
			data.tenants = data.tenants.values;
		}
		OpenStack.setTenants(data.tenants);
		$scope.tenants = data.tenants;
	}).error(function(data, status, headers, config) {
	});

});
portal.controller("TenantCtrl",function($scope, OpenStack) {
	
	OpenStack.services = {}
	
	angular.forEach(OpenStack.getAccess().serviceCatalog, function(service) {
		OpenStack.services[service.type] = service;
	});
	
	$scope.isKeystoneAdmin = OpenStack.getAccess().user.roles.filter(function(role) {
		return role.name == 'KeystoneAdmin' || role.name == 'KeystoneServiceAdmin';
	}).length > 0;
	
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

portal.controller("OtherwiseCtrl",function($scope, $location, OpenStack) {
	if($scope.isLoggedIn) {
		$location.path("/unscoped");
	} else {
		$location.path("/login");
	}
});
