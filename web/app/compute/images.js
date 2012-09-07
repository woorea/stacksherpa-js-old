stacksherpa.controller("ImageListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/compute/images/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/images/create.html'});
		
	}
	
	$scope.onLaunch = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/launch.html'});
		
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
		nova.listImages({}, function(data) {
			$scope.images = data.images;
			$scope.$apply();
		});
	}
	
	$scope.logo = function(name) {
		name = name.toLowerCase();
		if(name.startsWith('debian')) {
			return 'images/icons/debian.png';
		} else if (name.startsWith('ubuntu')){
			return 'images/icons/ubuntu.png';
		} else if (name.startsWith('fedora')){
			return 'images/icons/fedora.png';
		} else if (name.startsWith('windows')){
			return 'images/icons/windows.png';
		} else {
			return 'images/icons/linux.png';
		}
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("ImageShowCtrl", function($rootScope, $scope, $routeParams, $location) {

	$scope.page = 'views/compute/images/show.html'

});