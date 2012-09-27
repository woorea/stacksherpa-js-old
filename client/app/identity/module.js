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
var identity_error_handler = function(data, status, headers, config) {
	try {
		if(data.error) {
			$.bootstrapGrowl(data.error.message, {type : 'error'});
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
			$.bootstrapGrowl("Tenant created", {type : 'success'});
			$scope.$root.$broadcast('tenants.refresh');
			$scope.hide();
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
			$.bootstrapGrowl("User created", {type : 'success'});
			$scope.$root.$broadcast('users.refresh');
			$scope.hide();
		}).error(identity_error_handler);
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

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/roles",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.roles = data.roles;
		}).error(identity_error_handler);
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
			$.bootstrapGrowl("Role created", {type : 'success'});
			$scope.$root.$broadcast('users.refresh');
			$scope.hide();
		}).error(identity_error_handler);
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

	$scope.onRefresh = function(sync) {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/OS-KSADM/services",
			refresh : sync
		}).success(function(data, status, headers, config) {
			$scope.services = data["OS-KSADM:services"];
		}).error(identity_error_handler);
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
	}).error(identity_error_handler);
	
	$scope.onRefreshEndpoints = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/endpoints",
			refresh : true
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
			$.bootstrapGrowl("Service created", {type : 'success'});
			$scope.$root.$broadcast('services.refresh');
			$scope.hide();
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
				$scope.onRefreshEndpoints();
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
		}).error(identity_error_handler);
	}
	
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
			$.bootstrapGrowl("Endpoint created", {type : 'success'});
			$scope.onRefreshEndpoints();
			$scope.hide();
		}).error(identity_error_handler);
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

/*
{'quota_set': {'instances': 50, 'cores': 50,
                              'ram': 51200, 'volumes': 10,
                              'gigabytes': 1000, 'floating_ips': 10,
                              'metadata_items': 128, 'injected_files': 5,
                              'injected_file_content_bytes': 10240,
                              'security_groups': 10,
                              'security_group_rules': 20,
                              'key_pairs': 100}}

*/