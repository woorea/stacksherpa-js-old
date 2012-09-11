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
			console.log(data);
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
	
	var endpoint = OpenStack.endpoint("object-store",$routeParams.region, "publicURL");
	
	$scope.onCreateDirectory = function() {
		
		OpenStack.ajax({
			method : "PUT",
			url : endpoint + "/" + $routeParams.container + "/" + $scope.name,
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
		
		console.log(OpenStack.proxy);
		
		var endpoint = OpenStack.endpoint("object-store",$routeParams.region, "publicURL");

	      $.ajax({
			crossDomain : true,
			type: "PUT",
			url : OpenStack.proxy,
			//url : endpoint + "/" + $routeParams.container + "/" + file.name,
			headers : {
				"X-Auth-Token" : OpenStack.access.token.id,
				"X-URI" : endpoint + "/" + $routeParams.container + "/" + file.name
			},
	        data: file,
			dataType : "json",
	        processData: false,
	        contentType: false,
	        success: function(data) {
	          console.log(data);
				$scope.onRefresh();
	        },
	        error: function(data) {
	          console.log(data);
	        }
	      });
	};
	
	$scope.onDownload = function(object) {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/" + $routeParams.container + "/" + object.name
		}).success(function(data, status, headers, config) {
			$scope.objects = data;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/" + $routeParams.container + "?format=json"
		}).success(function(data, status, headers, config) {
			$scope.objects = data;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();
	
	var file;

	// Set an event listener on the Choose File field.
	$('#fileselect').bind("change", function(e) {
	      var files = e.target.files || e.dataTransfer.files;
	      // Our file var now holds the selected file
	      file = files[0];
	});

	    // This function is called when the user clicks on Upload to Swift. 
		// It will create the REST API request to upload this image to Swift.
	
});

/*
TODO: Temp URLs

var method = 'GET'
var expires = (new Date).getTime() / 1000.0;
var path = '/v1/AUTH_account/container/object'
var hash = CryptoJS.HmacSHA1(method"\\n"+expires+"\\n"+path, 'mykey');
//.hexdigest()

*/