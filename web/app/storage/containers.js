stacksherpa.controller("ContainerListCtrl", function($rootScope, $scope, $location, $routeParams) {
	
	$scope.page = 'views/storage/containers/list.html'
	
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
		swift.listContainers(function(data) {
			$scope.tenants = data.tenants;
			$scope.$apply();
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("ContainerShowCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/storage/containers/show.html'

});