var identity = angular.module("identity",[]);
identity.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/identity/tenants", {
			controller : "TenantListCtrl", templateUrl : "app/identity/views/tenants/list.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/:id", {
			controller : "TenantShowCtrl", templateUrl : "app/identity/views/tenants/show.html", menu : "tenants"
		})
		.when("/:tenant/identity/users", {
			controller : "identity.UserListCtrl", templateUrl : "app/identity/views/users/list.html", menu : "users"
		})
		.when("/:tenant/identity/users/:id", {
			controller : "UserShowCtrl", templateUrl : "app/identity/views/users/show.html", menu : "users"
		})
		.when("/:tenant/identity/roles", {
			controller : "RoleListCtrl", templateUrl : "app/identity/views/roles/list.html", menu : "roles"
		})
		.when("/:tenant/identity/roles/:id", {
			controller : "RoleShowCtrl", templateUrl : "app/identity/views/roles/show.html", menu : "roles"
		})
		.when("/:tenant/identity/services", {
			controller : "ServiceListCtrl", templateUrl : "app/identity/views/services/list.html", menu : "services"
		})
		.when("/:tenant/identity/services/:id", {
			controller : "ServiceShowCtrl", templateUrl : "app/identity/views/services/show.html", menu : "services"
		})
		.when("/:tenant/identity/endpoints", {
			controller : "EndpointListCtrl", templateUrl : "app/identity/views/endpoints/list.html", menu : "endpoints"
		})
		.when("/:tenant/identity/endpoints/:id", {
			controller : "EndpointShowCtrl", templateUrl : "app/identity/views/endpoints/show.html", menu : "endpoints"
		})
		.when("/:tenant/identity", { redirectTo : function(routeParams, locationPath, locationSearch) {
			return locationPath + "/tenants";
		}})
});
identity.controller("TenantListCtrl",function($scope, $routeParams, OpenStack) {

	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function(item) {
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/tenants/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/tenants/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants"
		}).success(function(data, status, headers, config) {
			$scope.tenants = data.tenants;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();

	

});
identity.controller("TenantShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants/" + $routeParams.id
		}).success(function(data, status, headers, config) {
			$scope.tenant = data.tenant;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.$on('tenants.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
identity.controller("TenantCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.tenant = {
		name : "",
		description : "",
		enabled : true
	}

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/tenants/",
			data : { tenant : $scope.tenant }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('tenants.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});


identity.controller("identity.UserListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.onDelete = function(item) {
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/users/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh(true);
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/users/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	$scope.onRefresh = function(sync) {
		console.log("refresh");
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/users",
			refresh : sync
		}).success(function(data, status, headers, config) {
			if(data.users) {
				$scope.users = data.users;
			} else {
				//weird: if tenant only have one user a object is returned instead of array
				$scope.users = [data.user]
			}
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.$on('users.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);
	
});
identity.controller("UserShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/users/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.user = data.user;
	}).error(function(data, status, headers, config) {
	
	});
	
});
identity.controller("UserCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.user = {
		
	}
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/tenants"
	}).success(function(data, status, headers, config) {
		$scope.tenants = data.tenants;
	}).error(function(data, status, headers, config) {

	});

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/users",
			data : { user : $scope.user }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('users.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

identity.controller("RoleListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function() {
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/OS-KSADM/roles/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/OS-KSADM/roles/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/roles"
		}).success(function(data, status, headers, config) {
			$scope.roles = data.roles;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.$on('roles.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
identity.controller("RoleShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/OS-KSADM/roles/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.role = data.role;
	}).error(function(data, status, headers, config) {
	
	});
	
});
identity.controller("RoleCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.role = {
		
	}

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/OS-KSADM/roles",
			data : { role : $scope.role }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('users.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

identity.controller("ServiceListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function() {
		
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/OS-KSADM/services/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/OS-KSADM/services/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/services"
		}).success(function(data, status, headers, config) {
			$scope.services = data["OS-KSADM:services"];
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.$on('services.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();
	
});
identity.controller("ServiceShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/OS-KSADM/services/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.service = data["OS-KSADM:service"];
	}).error(function(data, status, headers, config) {
	
	});
	
	$scope.onRefreshEndpoints = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/endpoints"
		}).success(function(data, status, headers, config) {
			$scope.endpoints = data.endpoints.filter(function(endpoint) {
				return (endpoint.service_id.localeCompare($routeParams.id) == 0);
			});
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefreshEndpoints();
	
});

identity.controller("ServiceCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.service = {
		
	}

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/OS-KSADM/services",
			data : { "OS-KSADM:service" : $scope.service }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('services.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

identity.controller("EndpointListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function(item) {
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/endpoints/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh();
			}).error(function(data, status, headers, config) {

			});
		} else {
			angular.forEach($scope.endpoints, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/endpoints/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(function(data, status, headers, config) {

					});
				}
			});
		}
	}

	/*
	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/endpoints"
		}).success(function(data, status, headers, config) {
			$scope.endpoints = data.endpoints;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.$on('endpoints.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();
	*/
	
});
identity.controller("EndpointShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/endpoints/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.endpoint = data.endpoint;
	}).error(function(data, status, headers, config) {
	
	});
	
});
identity.controller("EndpointCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.endpoint = {
		service_id : $scope.service.id,
		publicurl : "",
		internalurl : "",
		adminurl : ""
	}
	
	$scope.$watch('endpoint.publicurl', function(new_value, old_value) {
		$scope.endpoint.internalurl = new_value;
		$scope.endpoint.adminurl = new_value;
	});
	
	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/endpoints",
			data : { "endpoint" : $scope.endpoint }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('endpoints.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});
