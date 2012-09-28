angular.module("compute.directives",[])
	.directive('serverActions', function($routeParams, $timeout, OpenStack) {
		return {
			restrict : 'C',
			link : function(scope, element, attrs) {
				scope.onPause = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { pause : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onUnpause = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { unpause : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onSuspend = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { suspend : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onResume = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { resume : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onLock = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { lock : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onUnlock = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { unlock : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onResizeConfirm = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { confirmResize : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.onResizeRevert = function(server) {
					OpenStack.Servers.action($routeParams.region, server.id, { revertResize : {} });
					$timeout(function() { scope.refresh(true) }, 5000);
				}

				scope.delete = function(server) {
					OpenStack.Servers.delete($routeParams.region, server.id, function(data) {
						OpenStack.broadcast('delete.success');
					});
				}
				
			}
		}
	})
	.directive('selectFlavor', function($routeParams, $timeout, OpenStack) {
		return {
			restrict : 'C',
			templateUrl : 'app/compute/views/common/_select_flavor.html',
			link : function(scope, element, attrs) {
			}
		}
	})