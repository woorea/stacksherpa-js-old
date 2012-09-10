var storage = angular.module("storage",[]);
storage.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/storage/:region/containers", {controller : "ContainerListCtrl", templateUrl : "app/storage/views/containers/list.html"})
		.when("/:tenant/storage/:region/containers/:name", {controller : "ContainerShowCtrl", templateUrl : "app/storage/views/containers/show.html"})
});
storage.controller("ContainerListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("object-store",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		OpenStack.ajax({
			method : "PUT",
			url : endpoint + "/" + $scope.name
		}).success(function(data, status, headers, config) {
			$scope.name = '';
			$scope.onRefresh();
			/*
			$scope.servers = [];
			angular.forEach(data.servers, function(server) {
				server.checked = false;
				$scope.servers.push(server);
			});
			*/
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "?format=json"
		}).success(function(data, status, headers, config) {
			$scope.containers = data;
			/*
			$scope.servers = [];
			angular.forEach(data.servers, function(server) {
				server.checked = false;
				$scope.servers.push(server);
			});
			*/
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();

});
storage.controller("ContainerShowCtrl",function($scope) {
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/" + $routeParams.name + "?format=json"
		}).success(function(data, status, headers, config) {
			$scope.objects = data;
			/*
			$scope.servers = [];
			angular.forEach(data.servers, function(server) {
				server.checked = false;
				$scope.servers.push(server);
			});
			*/
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();
	
	
});
