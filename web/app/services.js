stacksherpa.controller("ServiceListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/identity/services/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/identity/services/create.html'});
		
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
		keystone.listServices(function(data) {
			$scope.services = data.services;
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("ServiceShowCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/identity/services/show.html'

});