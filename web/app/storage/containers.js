stacksherpa.controller("ContainerListCtrl", function($rootScope, $scope, $location, $routeParams) {
	
	$scope.page = 'views/storage/containers/list.html'
	
	$scope.projectId = $routeParams.projectId
	
	$scope.regionName = $routeParams.regionName
	
	console.log($routeParams)
	
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
			$scope.containers = data;
			$scope.$apply();
		});
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("ContainerShowCtrl", function($rootScope, $scope, $routeParams, $location) {
	
	$scope.page = 'views/storage/containers/show.html'
	
	$scope.projectId = $routeParams.projectId
	
	$scope.regionName = $routeParams.regionName
	
	$scope.containerName = $routeParams.containerName
	
	$scope.onRefresh = function() {
		
		swift.listObjects(function(data) {
			$scope.objects = data;
			$scope.$apply();
		});
		
	}
	
	$scope.onRefresh();

});