var keyPairs = [
	{"name" : "eureka.1"},
	{"name" : "eureka.2"},
	{"name" : "eureka.3"}
]
var securityGroups = [
	{"id" : "sg.1", "name" : "eureka.1"},
	{"id" : "sg.2", "name" : "eureka.2"},
	{"id" : "sg.3", "name" : "eureka.3"}
]

var servers = [
	{"id" : "server.1", "name" : "eureka.1", "flavor" : "1 vCPU, 1 Gb RAM, 20 Gb Disk", "image" : "ubuntu", "status" : "ACTIVE"},
	{"id" : "server.2", "name" : "eureka.2", "flavor" : "1 vCPU, 1 Gb RAM, 20 Gb Disk", "image" : "ubuntu", "status" : "ACTIVE"},
	{"id" : "server.3", "name" : "eureka.3", "flavor" : "1 vCPU, 1 Gb RAM, 20 Gb Disk", "image" : "ubuntu", "status" : "ACTIVE"}
]

compute.controller("ServerListCtrl", function($rootScope, $scope, $compile, nova) {
	
	$scope.page = 'views/compute/servers/list.html'
	
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
		
		nova.get("/servers/detail", function(data) {
			var servers = data.servers;
			$.each(servers, function(idx, server) {
				nova.get("/flavors/" + server.flavor.id, function(data) {
					servers[idx].flavor = data.flavor;
					$scope.$digest();
				});
				nova.get("/images/" + server.image.id, function(data) {
					servers[idx].image = data.image;
					$scope.$digest();
				});
			});
			$scope.servers = servers;
		});
		
	}
	
	$scope.$on('servers.refresh', function(event, args) {
		$scope.onRefresh();
	})
	
	$scope.onRefresh();

});
compute.controller("ServerShowCtrl", function($rootScope, $scope, $routeParams, $location, nova) {
	
	$scope.page = 'views/compute/servers/show.html'
	
	$scope.onReboot = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/reboot.html'});
	}
	
	$scope.onPause = function() {
		$scope.server.status = 'PAUSED';
	}
	
	$scope.onUnpause = function() {
		$scope.server.status = 'ACTIVE';
	}
	
	$scope.onSuspend = function() {
		$scope.server.status = 'SUSPENDED';
	}
	
	$scope.onResume = function() {
		$scope.server.status = 'ACTIVE';
	}
	
	$scope.onLock = function() {
		$scope.server.status = 'LOCKED';
	}
	
	$scope.onUnlock = function() {
		$scope.server.status = 'ACTIVE';
	}
	
	$scope.onShowConsoleOutput = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/console.html'});
	}
	
	$scope.onShowSSHConnectionInformation = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/sshinfo.html'});
	}
	
	$scope.onVNCConnection = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/vnc.html'});
	}
	
	$scope.onCreateImage = function() {
		alert('create image');
	}
	
	$scope.onChangePassword = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/change-password.html'});
	}
	
	$scope.onCreateBackup = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/backup.html'});
	}
	
	$scope.onRebuild = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/rebuild.html'});
	}
	
	$scope.onResize = function() {
		$rootScope.$broadcast('modal.show',{view : 'views/compute/servers/resize.html'});
	}
	
	$scope.onResizeConfirm = function() {
		alert('resize confirm');
	}
	
	$scope.onResizeRevert = function() {
		alert('resize revert');
	}
	
	/*
	$scope.server = servers.filter(function(server) {
		return server.id == $routeParams.serverId
	})[0];
	*/
	
	$scope.onDelete = function() {
		nova.delete("/servers/" + $routeParams.serverId, function(data) {
			$location.path("/projects/:projectId/region/:regionName/servers");
			$scope.$apply();
		});
	}

	$scope.onRefresh = function() {
		nova.get("/servers/" + $routeParams.serverId, function(data) {
			$scope.server = data.server;
			$scope.$digest();
		});
	}

	$scope.onRefresh();

});

compute.controller("ServerRebootCtrl", function($rootScope, $scope, nova) {
	
	$scope.onReboot = function() {
		$rootScope.$broadcast('modal.hide');
	}
	
});

compute.controller("ServerLaunchCtrl", function($rootScope, $scope, nova) {
	
	$scope.server = {
		metadata : {},
		personality : [],
		securityGroups : [],
		min : 1,
		max : 1,
		diskConfig : 'AUTO'
	}
	
	var $steps = $('.step')
	
	var $footer = $('.modal-footer')
	var $previous = $footer.find('.btn-previous')
	var $next = $footer.find('.btn-next')
	var $finish = $footer.find('.btn-finish')
	
	var ui = function() {
		$previous.prop("disabled", $scope.step == 0)
		$next.hide();
		$finish.hide();
		if($scope.step == $steps.length - 1) {
			$next.hide();
			$finish.show();
		} else {
			$next.show();
			$finish.hide();
		}
	}
	
	$scope.show = function(step) {
		if(step >= 0 && step < $steps.length) {
			$scope.step = step;
			$steps.hide().filter(":eq("+step+")").show();
			ui();
		}
	}
	
	$scope.onCancel = function() {
		$rootScope.$broadcast('modal.hide');
	}
	
	$scope.onPrevious = function() {
		$scope.show($scope.step - 1)
	}
	
	$scope.onNext = function() {
		$scope.show($scope.step + 1)
	}
	
	$scope.onFinish = function() {
		nova.post('/servers', {server : $scope.server}, function(data) {
			$rootScope.$broadcast('servers.refresh');
			$scope.onCancel();
			$scope.$apply();
		});
	}
	
	$scope.totalSteps = $steps.length;
	
	$scope.show(0);
	
});
compute.controller("LaunchServerSelectImageCtrl",function($scope, nova) {
	
	$scope.images = []

	$scope.onRender = function() {
		nova.listImages({}, function(data) {
			$scope.images = data.images;
			$scope.$apply();
		});
	}
	
	$scope.onSelectImage = function(image) {
		$scope.server.imageRef = image.id;
		$scope.onNext()
	}
	
	$scope.onRender();
	
});
compute.controller("LaunchServerConfigurationCtrl",function($scope, nova) {

	$scope.flavors = []
	
	$scope.onRender = function() {
		nova.listFlavors({}, function(data) {
			$scope.flavors = data.flavors;
			$scope.$apply();
		});
	}
	
	$scope.onSelectImage = function() {
		$scope.onNext()
	}
	
	$scope.onRender();
	
});
compute.controller("LaunchServerMetadataCtrl",function($scope) {
	
	$scope.onAddMetadata = function() {
		$scope.server.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.server.metadata[key]
	}
	
});
compute.controller("LaunchServerPersonalityCtrl",function($scope) {
	
	$scope.onAddPersonality = function() {
		$scope.server.personality.push({"path" : $scope.path, "contents" : $scope.contents});
		$scope.path = $scope.contents = ''
	}
	
	$scope.onRemovePersonality = function(path) {
		$scope.server.personality = $scope.server.personality.filter(function(item) {
			return !(item.path == path);
		})
	}
	
});
compute.controller("LaunchServerSecurityCtrl",function($scope, nova) {
	
	$scope.keyPairs = []
	$scope.securityGroups = []
	
	$scope.onRender = function() {
		nova.listKeyPairs(function(data) {
			$scope.keyPairs = data.keypairs;
			$scope.$apply();
		});
		nova.listSecurityGroups(function(data) {
			$scope.securityGroups = $.map(data["security_groups"], function(securityGroup) {
				return {"name" : securityGroup.name}
			});
			$scope.$apply();
		});
	}
	
	$scope.onRender();
	
});
compute.controller("LaunchServerSummaryCtrl",function($scope) {
	
});