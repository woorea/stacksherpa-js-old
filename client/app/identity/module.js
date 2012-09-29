var identity = angular.module("identity",[]);
identity.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/identity/tenants", {
			controller : "TenantListCtrl", templateUrl : "app/identity/views/tenants/list.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/usage", {
			controller : "TenantListCtrl", templateUrl : "app/identity/views/tenants/usage.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/quotas", {
			controller : "TenantListCtrl", templateUrl : "app/identity/views/tenants/quotas.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/:id", {
			controller : "TenantShowCtrl", templateUrl : "app/identity/views/tenants/tenant/show.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/:id/users", {
			controller : "TenantShowCtrl", templateUrl : "app/identity/views/tenants/tenant/users.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/:id/quotas", {
			controller : "TenantShowCtrl", templateUrl : "app/identity/views/tenants/tenant/quotas.html", menu : "tenants"
		})
		.when("/:tenant/identity/tenants/:id/usage", {
			controller : "TenantShowCtrl", templateUrl : "app/identity/views/tenants/tenant/usage.html", menu : "tenants"
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
				$scope.onRefresh(true);
			}).error(OpenStack.error_handler.identity);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/tenants/" + item.id
					})
					.success(function(data, status, headers, config) {})
					.error(OpenStack.error_handler.identity);
				}
			});
		}
	}

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.tenants = data.tenants;
		}).error(OpenStack.error_handler.identity);
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
		}).error(OpenStack.error_handler.identity);
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
		}).error(OpenStack.error_handler.identity);
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/roles",
			refresh : sync,
		}).success(function(data, status, headers, config) {
			$scope.roles = data.roles;
		}).error(OpenStack.error_handler.identity);
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
		}).error(OpenStack.error_handler.identity);
		
	}
	
	$scope.addUserOnTenant = function(user_id, role_id) {
		OpenStack.ajax({
			method : "PUT",
			url : endpoint + "/tenants/" + $routeParams.id + "/users/" + user_id + "/roles/OS-KSADM/" + role_id
		}).success(function(data, status, headers, config) {
			$scope.onRefresh(true)
		}).error(OpenStack.error_handler.identity);
	}
	
	$scope.removeUserFromTenant = function(user_id, role_id) {
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/tenants/" + $routeParams.id + "/users/" + user_id + "/roles/OS-KSADM/" + role_id
		}).success(function(data, status, headers, config) {
			$scope.onRefresh(true)
		}).error(OpenStack.error_handler.identity);
	}
	
	
	
	$scope.onRefresh(false);

});
identity.controller("TenantQuotaClassSetCtrl",function($scope, OpenStack) {
	$scope.update = function() {
		OpenStack.ajax({
			method : "PUT",
			url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-quota-class-sets/default',
			data : {quota_class_set : $scope.quota_class_set}
		}).success(function(data) {
			$scope.quota_class_set = data.quota_class_set;
		}).error(function(error) {
			console.error(error);
		})
	}
	
	$scope.refresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-quota-class-sets/default',
			refresh : sync
		}).success(function(data) {
			scope.quota_class_set = data.quota_class_set;
		}).error(function(error) {
			alert(error);
		})
	}
	
	$scope.refresh(false);
	
});
identity.controller("TenantQuotaSetCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.form_fields = [
		{name : "injected_file_content_bytes", description : ""},
		{name : "metadata_items", description : ""},
		{name : "volumes", description : ""},
		{name : "gigabytes", description : ""},
		{name : "ram", description : ""},
		{name : "floating_ips", description : ""},
		{name : "key_pairs", description : ""},
		{name : "id", description : ""},
		{name : "instances", description : ""},
		{name : "security_group_rules", description : ""},
		{name : "injected_files", description : ""},
		{name : "injected_file_path_bytes", description : ""},
		{name : "security_groups", description : ""},
	]
	
	$scope.update = function() {
		OpenStack.ajax({
			method : "PUT",
			url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-quota-sets/' + $routeParams.id,
			data : {quota_set : $scope.quota_set}
		}).success(function(data) {
			$scope.quota_set = data.quota_set;
		}).error(function(error) {
			console.error(error);
		})
	}
	
	$scope.refresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-quota-sets/' + $routeParams.id,
			refresh : true
		}).success(function(data) {
			$scope.quota_set = data.quota_set;
		}).error(function(error) {
			alert(error);
		})
	}
	
	$scope.refresh(false);
	
});
identity.controller("TenantUsageCtrl",function($scope, $routeParams, OpenStack) {
	
	OpenStack.ajax({
		method : "GET",
		url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-quota-sets/' + $routeParams.id,
		refresh : true
	}).success(function(data) {
		$scope.quota_set = data.quota_set;
	}).error(function(error) {
		alert(error);
	})
	
	$scope.query = function() {
		
		var url = OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-simple-tenant-usage?detailed=1'

		if($scope.start) {
			url += '&start=' + $scope.start + 'T00:00:00';
		}
		if($scope.end) {
			url += '&endp='  + $scope.end + 'T00:00:00';
		}
		
		OpenStack.ajax({
			method : "GET",
			url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-simple-tenant-usage/' + $routeParams.id
		}).success(function(data) {
			$scope.tenant_usage = data.tenant_usage;
		}).error(function(error) {
			alert(error);
		})
	}
	
	$scope.query(false)
	
});
identity.controller("TenantsUsageCtrl",function($scope, OpenStack) {
	
	$scope.query = function(sync) {
		
		var url = OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-simple-tenant-usage?detailed=1'
		
		if($scope.start) {
			url += '&start=' + $scope.start + 'T00:00:00';
		}
		if($scope.end) {
			url += '&endp='  + $scope.end + 'T00:00:00';
		}
		
		OpenStack.ajax({
			method : "GET",
			url : url,
			refresh : sync
		}).success(function(data) {
			$scope.tenant_usages = data.tenant_usages;
		}).error(function(error) {
			console.error(error);
		})
	}
	
	$scope.query(false)
	
});
identity.controller("TenantCreateCtrl",function($scope, $routeParams, notifications, OpenStack) {
	
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
			notifications.success("Tenant created");
			$scope.hide();
			$scope.onRefresh(true);
		}).error(OpenStack.error_handler.identity);
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
			}).error(OpenStack.error_handler.identity);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/users/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(OpenStack.error_handler.identity);
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
		}).error(OpenStack.error_handler.identity);
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
	}).error(OpenStack.error_handler.identity);
	
});
identity.controller("UserCreateCtrl",function($scope, $routeParams, notifications, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.user = {
		
	}
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/tenants"
	}).success(function(data, status, headers, config) {
		$scope.tenants = data.tenants;
	}).error(OpenStack.error_handler.identity);

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/users",
			data : { user : $scope.user }
		}).success(function(data, status, headers, config) {
			notifications.success("User created");
			$scope.onRefresh(true);
			$scope.hide();
		}).error(OpenStack.error_handler.identity);
	}

});

identity.controller("RoleListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function(item) {
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/OS-KSADM/roles/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh(true);
			}).error(OpenStack.error_handler.identity);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/OS-KSADM/roles/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(OpenStack.error_handler.identity);
				}
			});
		}
	}

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/roles",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.roles = data.roles;
		}).error(OpenStack.error_handler.identity);
	}
	
	$scope.$on('roles.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

});
identity.controller("RoleShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/OS-KSADM/roles/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.role = data.role;
	}).error(OpenStack.error_handler.identity);
	
});
identity.controller("RoleCreateCtrl",function($scope, $routeParams, notifications, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.role = {
		
	}

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/OS-KSADM/roles",
			data : { role : $scope.role }
		}).success(function(data, status, headers, config) {
			notifications.success('Role created');
			$scope.onRefresh(true);
			$scope.hide();
		}).error(OpenStack.error_handler.identity);
	}

});

identity.controller("ServiceListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	$scope.onDelete = function(item) {
		
		if(typeof item != 'undefined') {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/OS-KSADM/services/" + item.id
			}).success(function(data, status, headers, config) {
				$scope.onRefresh(true);
			}).error(OpenStack.error_handler.identity);
		} else {
			angular.forEach($scope.tenants, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/OS-KSADM/services/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(OpenStack.error_handler.identity);
				}
			});
		}
	}

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/services",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.services = data["OS-KSADM:services"];
		}).error(OpenStack.error_handler.identity);
	}
	
	$scope.$on('services.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);
	
});
identity.controller("ServiceShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/OS-KSADM/services/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.service = data["OS-KSADM:service"];
	}).error(OpenStack.error_handler.identity);
	
	$scope.onRefreshEndpoints = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/endpoints",
			refresh : true
		}).success(function(data, status, headers, config) {
			$scope.endpoints = data.endpoints.filter(function(endpoint) {
				return (endpoint.service_id.localeCompare($routeParams.id) == 0);
			});
		}).error(OpenStack.error_handler.identity);
	}
	
	$scope.onRefreshEndpoints();
	
});

identity.controller("ServiceCreateCtrl",function($scope, $routeParams, notifications, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL") || OpenStack.getProvider().identity.endpoints[0].adminURL;
	
	$scope.service = {
		
	}

	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/OS-KSADM/services",
			data : { "OS-KSADM:service" : $scope.service }
		}).success(function(data, status, headers, config) {
			notifications.success("Service created");
			$scope.hide();
			$scope.onRefresh(true);
		}).error(OpenStack.error_handler.identity);
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
				$scope.onRefreshEndpoints();
			}).error(OpenStack.error_handler.identity);
		} else {
			angular.forEach($scope.endpoints, function(item) {
				if(item.checked) {
					OpenStack.ajax({
						method : "DELETE",
						url : endpoint + "/endpoints/" + item.id
					}).success(function(data, status, headers, config) {
						
					}).error(OpenStack.error_handler.identity);
				}
			});
		}
	}
	
	$scope.onEdit = function(endpoint) {
		$scope.endpoint = endpoint;
	}
	
	$scope.onUpdate = function() {
		OpenStack.ajax({
			method : "PUT",
			url : endpoint + "/endpoints/" + $scope.endpoint.id,
			data : { "endpoint" : $scope.endpoint }
		}).success(function(data, status, headers, config) {
			$scope.endpoint = {}
			$scope.onRefreshEndpoints();
			$scope.$root.$broadcast('modal.hide');
		}).error(OpenStack.error_handler.identity);
	}
	
});
identity.controller("EndpointCreateCtrl",function($scope, $routeParams, notifications, OpenStack) {
	
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
			notifications.success("Endpoint created");
			$scope.hide();
			$scope.onRefreshEndpoints();
		}).error(OpenStack.error_handler.identity);
	}

});
identity.directive('quota', function($routeParams, OpenStack) {
	return {
		restrict : 'C',
		link : function(scope, element, attrs) {
			
		}
	}
});
identity.directive('tenantsUsage', function($routeParams, OpenStack) {
	return {
		restrict : 'C',
		link : function(scope, element, attrs) {
			
		}
	}
});
identity.directive('tenantUsage', function($routeParams, OpenStack) {
	return {
		restrict : 'C',
		link : function(scope, element, attrs) {
			
		}
	}
});