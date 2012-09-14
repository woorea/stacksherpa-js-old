angular.module('common.file-upload',[])
.config(function() {

})
.directive('fileUpload', function(OpenStack) {
	
	return function(scope, element, attrs) {
		element.bind("change", function(e) {
			var files = e.target.files || e.dataTransfer.files;
			scope.$apply(function() {
				scope.file = files[0];
			});
		});
	}
});
