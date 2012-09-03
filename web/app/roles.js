stacksherpa.controller("RoleListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/identity/roles/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/identity/roles/create.html'});
		
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
		keystone.listRoles(function(data) {
			$scope.roles = data.roles;
			$scope.$apply();
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("RoleShowCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/identity/roles/show.html'

});