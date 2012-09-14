var storage = angular.module("storage",[]);
storage.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/storage/:region/containers", {controller : "ContainerListCtrl", templateUrl : "app/storage/views/containers/list.html"})
		.when("/:tenant/storage/:region/containers/:container", {controller : "ContainerShowCtrl", templateUrl : "app/storage/views/containers/show.html"})
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
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onDelete = function(container) {
		
		
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/" + container.name
		}).success(function(data, status, headers, config) {
			$scope.onRefresh();
		}).error(function(data, status, headers, config) {
			alert(status);
		});
		
	}
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "?format=json"
		}).success(function(data, status, headers, config) {
			$scope.containers = data;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh();

});
storage.controller("ContainerShowCtrl",function($scope, $routeParams, $http, OpenStack) {
	
	$scope.endpoint = OpenStack.endpoint("object-store",$routeParams.region, "publicURL");
	
	$scope.onDelete = function(object) {
		
		OpenStack.ajax({
			method : "DELETE",
			url : $scope.endpoint + "/" + $routeParams.container + "/" + object.name,
		}).success(function(data, status, headers, config) {
			$scope.onRefresh();
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
	};
	
	$scope.onCreateDirectory = function() {
		
		OpenStack.ajax({
			method : "PUT",
			url : $scope.endpoint + "/" + $routeParams.container + "/" + $scope.name,
			data : "",
			headers : {
				"Content-Type" : "application/directory"
			}
		}).success(function(data, status, headers, config) {
			$scope.onRefresh();
		}).error(function(data, status, headers, config) {
			console.log(data);
		});
		
	};
	
	
	$scope.onUploadFile = function() {
			//TODO: create directive
	      $.ajax({
			crossDomain : true,
			type: "PUT",
			url : OpenStack.proxy,
			headers : {
				"X-Auth-Token" : OpenStack.access.token.id,
				"X-URI" : $scope.endpoint + "/" + $routeParams.container + "/" + file.name
			},
	        data: file,
			dataType : "json",
	        processData: false,
	        contentType: false,
	        success: function(data) {
				$scope.onRefresh();
	        },
	        error: function(data) {
	          console.log(data);
	        }
	      });
	};
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : $scope.endpoint + "/" + $routeParams.container + "?format=json"
		}).success(function(data, status, headers, config) {
			$scope.objects = data;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();
	
});

/*
TODO: Temp URLs

var method = 'GET'
var expires = (new Date).getTime() / 1000.0;
var path = '/v1/AUTH_account/container/object'
var hash = CryptoJS.HmacSHA1(method"\\n"+expires+"\\n"+path, 'mykey');
//.hexdigest()

*/