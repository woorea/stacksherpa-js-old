compute.controller("KeyPairListCtrl", function($rootScope, $scope, $compile, nova) {
	
	$scope.page = 'views/compute/keypairs/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/keypairs/create.html'});
		
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
		
		nova.listKeyPairs(function(data) {
			$scope.keypairs = data.keypairs;
			$scope.$apply();
		});
		
	}
	
	$scope.onRefresh();

});