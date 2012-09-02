stacksherpa.controller("EndpointListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/identity/endpoints/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/identity/endpoints/create.html'});
		
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
		keystone.listEndpoints(function(data) {
			$scope.endpoints = data.endpoints;
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("EndpointShowCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/identity/endpoints/show.html'

});