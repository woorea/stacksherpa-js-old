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
			angular.forEach(items, function(item) {
				item.checked = scope.checkedAll;
			});
		}

		scope.allChecked = function() {
			var items = scope[attrs.withSelectionCheckboxes];
			if(items && items.length) {
				var isCheckedAll = true;
				angular.forEach(items, function(item) {
				    if (item && !item.checked) {
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
	
	$scope.providers = stacksherpa.config.providers;
	
	
	
	$scope.$watch('provider.name', function() {
		$scope.endpoint = $scope.provider.identity.endpoints[0];
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
		OpenStack.ajax({
			method : "POST",
			url : $scope.endpoint + "/tokens",
			data : {auth : $scope.auth[$scope.authentication]}
		}).success(function(data, status, headers, config) {
			if(data.access) {
				$scope.$root.isLoggedIn = true;
				OpenStack.setProvider($scope.provider);
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
			url : OpenStack.getProvider().identity.endpoints[0] + "/tokens",
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
	
	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : OpenStack.getProvider().identity.endpoints[0] + "/tenants",
			refresh : sync
		}).success(function(data, status, headers, config) {
			if(!angular.isArray(data.tenants)) {
				//weird json from trystack
				data.tenants = data.tenants.values;
			}
			OpenStack.setTenants(data.tenants);
			$scope.tenants = data.tenants;
		}).error(function(data, status, headers, config) {
		});
	}
	
	$scope.onRefresh(false);

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
