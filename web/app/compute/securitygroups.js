stacksherpa.controller("SecurityGroupListCtrl", function($rootScope, $scope, $compile) {
	
	$scope.page = 'views/compute/securitygroups/list.html'
	
	$scope.onCreate = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/securitygroups/create.html'});
		
	}
	
	$scope.onEdit = function() {
		
		$rootScope.$broadcast('modal.show',{view : 'views/compute/securitygroups/edit.html'});
		
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
		
		nova.listSecurityGroups(function(data) {
			$scope.security_groups = data.security_groups;
			$scope.$apply();
		});
		
	}
	
	$scope.onRefresh();

});
stacksherpa.controller("SecurityGroupEditCtrl", function($rootScope, $scope, $routeParams, $location) {

	$scope.page = 'views/compute/securitygroups/edit.html'

});