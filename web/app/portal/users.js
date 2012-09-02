stacksherpa.controller("PortalUserListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/portal/users/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/portal/users/create.html'});
		
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
		keystone.listUsers(function(data) {
			$scope.users = data.users;
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("PortalUserEditCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/portal/users/edit.html'

});