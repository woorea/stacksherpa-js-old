var identity = angular.module("identity",[]);
identity.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/identity/tenants", {controller : "TenantListCtrl", templateUrl : "app/identity/views/tenants/list.html"})
		.when("/:tenant/identity/tenants/:id", {controller : "TenantShowCtrl", templateUrl : "app/identity/views/tenants/show.html"})
		.when("/:tenant/identity/users", {controller : "UserListCtrl", templateUrl : "app/identity/views/users/list.html"})
		.when("/:tenant/identity/users/:id", {controller : "UserShowCtrl", templateUrl : "app/identity/views/users/show.html"})
		.when("/:tenant/identity/roles", {controller : "RoleListCtrl", templateUrl : "app/identity/views/roles/list.html"})
		.when("/:tenant/identity/roles/:id", {controller : "RoleShowCtrl", templateUrl : "app/identity/views/roles/show.html"})
		.when("/:tenant/identity/services", {controller : "ServiceListCtrl", templateUrl : "app/identity/views/services/list.html"})
		.when("/:tenant/identity/services/:id", {controller : "ServiceShowCtrl", templateUrl : "app/identity/views/services/show.html"})
		.when("/:tenant/identity/endpoints", {controller : "EndpointListCtrl", templateUrl : "app/identity/views/endpoints/list.html"})
		.when("/:tenant/identity/endpoints/:id", {controller : "EndpointShowCtrl", templateUrl : "app/identity/views/endpoints/show.html"})
});
identity.controller("TenantListCtrl",function($scope, $routeParams, OpenStack) {

	var endpoint = OpenStack.endpoint("identity", null, "adminURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/identity/views/tenants/create.html'});
		
	}

	$scope.onDelete = function() {
		
		$("tbody input[type=checkbox]").each(function(index) {
			if($(this).is(":checked")) {
				servers[index].toDelete = true
			}
		});
		
		$scope.servers = servers = servers.filter(function(server) {
			return !server.toDelete;
		});
		
		if(!servers.length) {
			$("thead input[type=checkbox]").prop("checked", false)
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
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/tenants/" + $routeParams.id
		}).success(function(data, status, headers, config) {
			$scope.tenant = data.tenant;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();

});
identity.controller("UserListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/identity/views/users/create.html'});
		
	}

	$scope.onDelete = function() {
		
		$("tbody input[type=checkbox]").each(function(index) {
			if($(this).is(":checked")) {
				servers[index].toDelete = true
			}
		});
		
		$scope.servers = servers = servers.filter(function(server) {
			return !server.toDelete;
		});
		
		if(!servers.length) {
			$("thead input[type=checkbox]").prop("checked", false)
		}
	}

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/users"
		}).success(function(data, status, headers, config) {
			$scope.users = data.users;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();
	
});
identity.controller("UserShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/users/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.user = data.user;
	}).error(function(data, status, headers, config) {
	
	});
	
});
identity.controller("RoleListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/identity/views/roles/create.html'});
		
	}

	$scope.onDelete = function() {
		
		$("tbody input[type=checkbox]").each(function(index) {
			if($(this).is(":checked")) {
				servers[index].toDelete = true
			}
		});
		
		$scope.servers = servers = servers.filter(function(server) {
			return !server.toDelete;
		});
		
		if(!servers.length) {
			$("thead input[type=checkbox]").prop("checked", false)
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
	
	$scope.onRefresh();

});
identity.controller("RoleShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/OS-KSADM/roles/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.role = data.role;
	}).error(function(data, status, headers, config) {
	
	});
	
});
identity.controller("ServiceListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/identity/views/services/create.html'});
		
	}

	$scope.onDelete = function() {
		
		$("tbody input[type=checkbox]").each(function(index) {
			if($(this).is(":checked")) {
				servers[index].toDelete = true
			}
		});
		
		$scope.servers = servers = servers.filter(function(server) {
			return !server.toDelete;
		});
		
		if(!servers.length) {
			$("thead input[type=checkbox]").prop("checked", false)
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
	
	$scope.onRefresh();
	
});
identity.controller("ServiceShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/OS-KSADM/services" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.services = data["OS-KSADM:services"];
	}).error(function(data, status, headers, config) {
	
	});
	
});
identity.controller("EndpointListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/identity/views/endpoints/create.html'});
		
	}

	$scope.onDelete = function() {
		
		$("tbody input[type=checkbox]").each(function(index) {
			if($(this).is(":checked")) {
				servers[index].toDelete = true
			}
		});
		
		$scope.servers = servers = servers.filter(function(server) {
			return !server.toDelete;
		});
		
		if(!servers.length) {
			$("thead input[type=checkbox]").prop("checked", false)
		}
	}

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/endpoints"
		}).success(function(data, status, headers, config) {
			$scope.endpoints = data.endpoints;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();
	
});
identity.controller("EndpointShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("identity", null, "adminURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/endpoints/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.endpoint = data.endpoint;
	}).error(function(data, status, headers, config) {
	
	});
	
});
