stacksherpa.controller("TenantListCtrl", function($rootScope, $scope, $location, $routeParams) {
	
	$scope.page = 'views/identity/tenants/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/identity/tenants/create.html'});
		
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
		keystone.listTenants(function(data) {
			$scope.tenants = data.tenants;
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("TenantShowCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/identity/tenants/show.html'

});