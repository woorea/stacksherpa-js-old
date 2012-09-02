stacksherpa.controller("VolumeListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/compute/volumes/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/volumes/create.html'});
		
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
	
	$scope.onAttach = function() {
		
		alert('attach')
		//$rootScope.$broadcast('modal.show',{view : 'views/compute/volumes/attach.html'});
		
	}
	
	$scope.onDetach = function() {
		
		alert('detach')
		
	}
	
	$scope.onCreateSnapshot = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/snapshots/create.html'});
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
stacksherpa.controller("VolumeShowCtrl", function($rootScope, $scope, $routeParams, $location) {

});