compute.controller("SnapshotListCtrl", function($rootScope, $scope, $compile, nova) {
	
	$scope.page = 'views/compute/snapshots/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/snapshots/create.html'});
		
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
	
	$scope.onCreateVolume = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/volumes/create.html'});
		
	}

	$scope.onRefresh = function() {
		
		nova.listSnapshots(function(data) {
			$scope.snapshots = data.snapshots;
			$scope.$apply();
		});
		
	}
	
	$scope.onRefresh();

});