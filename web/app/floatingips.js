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
		
		$.ajax({
			crossDomain: true,
			type : "GET",
			url : "data/flavors/list.json",
			headers : {
				//"X-URL" : "/tenants",
				//"X-Auth-Token" : data.access.token.id
			},
			dataType: "json",
			success : function(data) {
				$scope.images = data.images;
			}
		})
		
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("FloatingIpShowCtrl", function($rootScope, $scope, $routeParams, $location) {

});