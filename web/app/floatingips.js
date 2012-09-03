stacksherpa.controller("FloatingIpListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/compute/floatingips/list.html'
	
	$scope.onAllocate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/floatingips/allocate.html'});
		
	}
	
	$scope.onDeallocate = function() {
		
		alert('onDeallocate')
		
	}
	
	$scope.onAssociate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/floatingips/associate.html'});
		
	}
	
	$scope.onDissasociate = function() {
		
		alert('onDissasociate')
		
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
		
		nova.listFloatingIps(function(data) {
			$scope.floating_ips = data.floating_ips;
			$scope.$apply();
		});
		
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("FloatingIpShowCtrl", function($rootScope, $scope, $routeParams, $location) {

});