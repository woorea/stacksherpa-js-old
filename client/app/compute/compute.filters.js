angular.module("compute.filters",[])
	.filter('serverStatus', function() {
		return function(status) {
			if(status) {
				if(status.indexOf("ACTIVE") == 0) {
					return "success"
				} else {
					return "warning"
				}
			} else {
				return "warning"
			}
		}
	})