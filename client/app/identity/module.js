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
var identity_error_handler = function(data, status, headers, config) {
	try {
		if(data.error) {
			alert(data.error.message);
		}
		console.log(data);
		console.log(status);
		console.log(headers);
		console.log(config);
	} catch(e) {
		console.log(e);
	}
}
identity.controller("TenantListCtrl",function($scope, $routeParams, OpenStack) {

	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function(item) {
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/tenants/" + item.id
			}).success(function(data, status, headers, config) {	
			}).error(identity_error_handler);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/tenants/" + item.id
					})
					.success(function(data, status, headers, config) {})
					.error(identity_error_handler);
				}
			});
		}
		setTimeout(function() {
			$scope.onRefresh(true);
		},3000);
	}

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.tenants = data.tenants;
		}).error(identity_error_handler);
	}
	
	$scope.$on('tenants.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

});
identity.controller("TenantShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants/" + $routeParams.id,
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.tenant = data.tenant;
		}).error(identity_error_handler);
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
		}).error(identity_error_handler);
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/roles",
			refresh : sync,
		}).success(function(data, status, headers, config) {
			$scope.roles = data.roles;
		}).error(identity_error_handler);
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants/" + $routeParams.id + "/users",
			refresh : sync,
		}).success(function(data, status, headers, config) {
			$scope.users_on_tenant = data.users;
			angular.forEach(data.users, function(user) {
				OpenStack.ajax({
					method : "GET",
					url : endpoint + "/tenants/" + $routeParams.id + "/users/" + user.id + "/roles",
					refresh : sync
				}).success(function(data, status, headers, config) {
					user.roles_on_tenant = data.roles;
				}).error(function(data, status, headers, config) {

				});
			});
		}).error(identity_error_handler);
	}
	
	$scope.addUserOnTenant = function(user_id, role_id) {
		OpenStack.ajax({
			method : "PUT",
			url : endpoint + "/tenants/" + $routeParams.id + "/users/" + user_id + "/roles/OS-KSADM/" + role_id
		}).success(function(data, status, headers, config) {
			$scope.onRefresh(true)
		}).error(identity_error_handler);
	}
	
	$scope.removeUserFromTenant = function(user_id, role_id) {
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/tenants/" + $routeParams.id + "/users/" + user_id + "/roles/OS-KSADM/" + role_id
		}).success(function(data, status, headers, config) {
			$scope.onRefresh(true)
		}).error(identity_error_handler);
	}
	
	$scope.onRefresh(false);

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
		}).error(identity_error_handler);
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
			}).error(identity_error_handler);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/users/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(identity_error_handler);
				}
			});
		}
	}

	$scope.onRefresh = function(sync) {
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
		}).error(identity_error_handler);
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
	}).error(identity_error_handler);
	
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
	}).error(identity_error_handler);

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/users",
			data : { user : $scope.user }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('users.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(identity_error_handler);
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
			}).error(identity_error_handler);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/OS-KSADM/roles/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(identity_error_handler);
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
		}).error(identity_error_handler);
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
	}).error(identity_error_handler);
	
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
		}).error(identity_error_handler);
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
			}).error(identity_error_handler);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/OS-KSADM/services/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(identity_error_handler);
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
		}).error(identity_error_handler);
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
	}).error(identity_error_handler);
	
	$scope.onRefreshEndpoints = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/endpoints"
		}).success(function(data, status, headers, config) {
			$scope.endpoints = data.endpoints.filter(function(endpoint) {
				return (endpoint.service_id.localeCompare($routeParams.id) == 0);
			});
		}).error(identity_error_handler);
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
		}).error(identity_error_handler);
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
			}).error(identity_error_handler);
		} else {
			angular.forEach($scope.endpoints, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/endpoints/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(identity_error_handler);
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
	}).error(identity_error_handler);
	
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
		}).error(identity_error_handler);
	}

});
compute.filter('_rest', function() {
	return function(array) {
		return _.rest(array);
	}
});