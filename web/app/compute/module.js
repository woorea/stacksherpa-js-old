var compute = angular.module("compute",[]);
compute.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/compute/:region/servers", {controller : "ServerListCtrl", templateUrl : "app/compute/views/servers/list.html"})
		.when("/:tenant/compute/:region/servers/:id", {controller : "ServerShowCtrl", templateUrl : "app/compute/views/servers/show.html"})
		.when("/:tenant/compute/:region/images", {controller : "ImageListCtrl", templateUrl : "app/compute/views/images/list.html"})
		.when("/:tenant/compute/:region/images/:id", {controller : "ImageShowCtrl", templateUrl : "app/compute/views/images/show.html"})
		.when("/:tenant/compute/:region/flavors", {controller : "FlavorListCtrl", templateUrl : "app/compute/views/flavors/list.html"})
		.when("/:tenant/compute/:region/flavors/:id", {controller : "FlavorShowCtrl", templateUrl : "app/compute/views/flavors/show.html"})
		.when("/:tenant/compute/:region/floating-ips", {controller : "FloatingIpListCtrl", templateUrl : "app/compute/views/floatingips/list.html"})
		.when("/:tenant/compute/:region/volumes", {controller : "VolumeListCtrl", templateUrl : "app/compute/views/volumes/list.html"})
		.when("/:tenant/compute/:region/volumes/:id", {controller : "VolumeShowCtrl", templateUrl : "app/compute/views/volumes/show.html"})
		.when("/:tenant/compute/:region/snapshots", {controller : "SnapshotListCtrl", templateUrl : "app/compute/views/snapshots/list.html"})
		.when("/:tenant/compute/:region/snapshots/:id", {controller : "SnapshotShowCtrl", templateUrl : "app/compute/views/snapshots/show.html"})
		.when("/:tenant/compute/:region/key-pairs", {controller : "KeyPairListCtrl", templateUrl : "app/compute/views/keypairs/list.html"})
		.when("/:tenant/compute/:region/security-groups", {controller : "SecurityGroupListCtrl", templateUrl : "app/compute/views/securitygroups/list.html"})
		.when("/:tenant/compute/:region/security-groups/:id", {controller : "SecurityGroupShowCtrl", templateUrl : "app/compute/views/securitygroups/show.html"})
});
compute.controller("ServerListCtrl",function($scope, $routeParams, OpenStack) {

	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onLaunch = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/launch.html'});
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
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/servers/detail"
		}).success(function(data, status, headers, config) {
			angular.forEach(data.servers, function(server) {
				OpenStack.ajax({
					method : "GET",
					url : endpoint + "/images/" + server.image.id
				}).success(function(data, status, headers, config) {
					server.image = data.image;
				}).error(function(data, status, headers, config) {

				});
				OpenStack.ajax({
					method : "GET",
					url : endpoint + "/flavors/" + server.flavor.id
				}).success(function(data, status, headers, config) {
					server.flavor = data.flavor;
				}).error(function(data, status, headers, config) {

				});
			});
			$scope.servers = data.servers;
		}).error(function(data, status, headers, config) {

		});
		
	}
	/*
	$scope.checkAll = function() {
		angular.forEach($scope.servers, function(server) {
			server.checked = $scope.checkedAll;
		});
	}
	
	$scope.allChecked = function() {
		var isCheckedAll = true;
		angular.forEach($scope.servers, function(server) {
		    if (!server.checked) {
				isCheckedAll = false;
				return;
			}
		});
		return isCheckedAll;
	};
	*/
	
	$scope.$on('servers.refresh', function(event, args) {
		$scope.onRefresh();
	})
	
	$scope.onRefresh();

});
compute.controller("ServerShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onReboot = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/reboot.html'});
	}
	
	$scope.onPause = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				pause : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.server.status = 'PAUSED';
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onUnpause = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				unpause : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.server.status = 'ACTIVE';
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onSuspend = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				suspend : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.server.status = 'SUSPENDED';
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onResume = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				resume : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.server.status = 'ACTIVE';
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onLock = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				lock : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.server.status = 'LOCKED';
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onUnlock = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				unlock : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.server.status = 'ACTIVE';
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onShowConsoleOutput = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/console.html'});
	}
	
	$scope.onShowSSHConnectionInformation = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/sshinfo.html'});
	}
	
	$scope.onVNCConnection = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/vnc.html'});
	}
	
	$scope.onCreateImage = function() {
		alert('create image');
	}
	
	$scope.onChangePassword = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/change-password.html'});
	}
	
	$scope.onCreateBackup = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/backup.html'});
	}
	
	$scope.onRebuild = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/rebuild.html'});
	}
	
	$scope.onResize = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/resize.html'});
	}
	
	$scope.onResizeConfirm = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"confirmResize" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onResizeRevert = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"revertResize" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onDelete = function() {
		
		OpenStack.ajax({
			method : "DELETE",
			url : endpoint + "/servers/" + $routeParams.id
		}).success(function(data, status, headers, config) {
			$location.path("#/"+$routeParams.tenant+"/compute/"+$routeParams.region+"/servers");
		}).error(function(data, status, headers, config) {

		});
		
	}

	$scope.onRefresh = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/servers/" + $routeParams.id
		}).success(function(data, status, headers, config) {
			$scope.server = data.server;
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/images/" + $scope.server.image.id
			}).success(function(data, status, headers, config) {
				$scope.server.image = data.image;
			}).error(function(data, status, headers, config) {

			});
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/flavors/" + $scope.server.flavor.id
			}).success(function(data, status, headers, config) {
				$scope.server.flavor = data.flavor;
			}).error(function(data, status, headers, config) {

			});
		}).error(function(data, status, headers, config) {

		});
	}

	$scope.onRefresh();

});
compute.controller("ServerRebootCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onReboot = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				reboot : {
					type : $scope.type
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerShowConsoleOutputCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"os-console" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerShowVncConsoleCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"os-vnc-console" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerCreateImageCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onCreateImage = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"createImage" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerResizeCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onResizeServer = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"resize" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerRebuildCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onRebuildServer = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"rebuild" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerChangePasswordCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onChangePasswordServer = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"changePassword" : {}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerLaunchCtrl", function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");
	
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
		$scope.$root.$broadcast('modal.hide');
	}
	
	$scope.onPrevious = function() {
		$scope.show($scope.step - 1)
	}
	
	$scope.onNext = function() {
		$scope.show($scope.step + 1)
	}
	
	$scope.onFinish = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers",
			data : {server : $scope.server}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('servers.refresh');
			$scope.onCancel();
		}).error(function(data, status, headers, config) {
			alert(status);
		})
	}
	
	$scope.totalSteps = $steps.length;
	
	$scope.show(0);
	
});
compute.controller("LaunchServerSelectImageCtrl",function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");
	
	$scope.images = []

	$scope.onRender = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/images/detail"
		}).success(function(data, status, headers, config) {
			$scope.images = data.images;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onSelectImage = function(image) {
		$scope.server.imageRef = image.id;
		$scope.onNext()
	}
	
	$scope.onRender();
	
});
compute.controller("LaunchServerConfigurationCtrl",function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");

	$scope.flavors = []
	
	$scope.onRender = function() {
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/flavors/detail"
		}).success(function(data, status, headers, config) {
			$scope.flavors = data.flavors;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRender();
	
});
compute.controller("LaunchServerMetadataCtrl",function($scope) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");
	
	$scope.onAddMetadata = function() {
		$scope.server.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.server.metadata[key]
	}
	
});
compute.controller("LaunchServerPersonalityCtrl",function($scope) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");
	
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
compute.controller("LaunchServerSecurityCtrl",function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");
	
	$scope.keyPairs = []
	$scope.securityGroups = []
	
	$scope.onRender = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-keypairs"
		}).success(function(data, status, headers, config) {
			$scope.keyPairs = data.keypairs;
		}).error(function(data, status, headers, config) {

		});
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-security-groups"
		}).success(function(data, status, headers, config) {
			$scope.securityGroups = $.map(data["security_groups"], function(securityGroup) {
				return {"name" : securityGroup.name}
			});
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRender();
	
});
compute.controller("LaunchServerSummaryCtrl",function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$scope.$routeParams.region, "publicURL");
	
});
compute.controller("ImageListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/images/create.html'});
		
	}
	
	$scope.onLaunch = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/servers/launch.html'});
		
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
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/images/detail"
		}).success(function(data, status, headers, config) {
			$scope.images = data.images;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.logo = function(name) {
		name = name.toLowerCase();
		if(name.startsWith('debian')) {
			return '/images/icons/debian.png';
		} else if (name.startsWith('ubuntu')){
			return '/images/icons/ubuntu.png';
		} else if (name.startsWith('fedora')){
			return '/images/icons/fedora.png';
		} else if (name.startsWith('windows')){
			return '/images/icons/windows.png';
		} else {
			return '/images/icons/linux.png';
		}
	}
	
	$scope.onRefresh();
	
});
compute.controller("ImageShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/images" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.image = data.image;
	}).error(function(data, status, headers, config) {
	
	});
	
});
compute.controller("FlavorListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/flavors/create.html'});
		
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
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/flavors/detail"
		}).success(function(data, status, headers, config) {
			$scope.flavors = data.flavors;
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onRefresh();

});
compute.controller("FlavorShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/flavors/" + $routeParams.id
	}).success(function(data, status, headers, config) {
		$scope.flavors = data.flavors;
	}).error(function(data, status, headers, config) {
	
	});
	
});
compute.controller("FloatingIpListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onAllocate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/floatingips/allocate.html'});
		
	}
	
	$scope.onDeallocate = function() {
		
		alert('onDeallocate')
		
	}
	
	$scope.onAssociate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/floatingips/associate.html'});
		
	}
	
	$scope.onDissasociate = function() {
		
		alert('onDissasociate')
		
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
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-floating-ips"
		}).success(function(data, status, headers, config) {
			$scope.floating_ips = data.floating_ips;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh();

});
compute.controller("VolumeListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/volumes/create.html'});
		
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
	
	$scope.onAttach = function() {
		
		alert('attach')
		//$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/volumes/attach.html'});
		
	}
	
	$scope.onDetach = function() {
		
		alert('detach')
		
	}
	
	$scope.onCreateSnapshot = function() {
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/snapshots/create.html'});
	}

	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-volumes"
		}).success(function(data, status, headers, config) {
			$scope.volumes = data.volumes;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh();
	
});
compute.controller("VolumeShowCtrl",function($scope, $routeParams, OpenStack) {
});
compute.controller("SnapshotListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/snapshots/create.html'});
		
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
	
	$scope.onCreateVolume = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/volumes/create.html'});
		
	}

	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-snapshots"
		}).success(function(data, status, headers, config) {
			$scope.snapshots = data.snapshots;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh();

	
	
});
compute.controller("SnapshotShowCtrl",function($scope, $routeParams, OpenStack) {
});
compute.controller("KeyPairListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/keypairs/create.html'});
		
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
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-keypairs"
		}).success(function(data, status, headers, config) {
			$scope.keypairs = data.keypairs;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh();

	
	
});
compute.controller("SecurityGroupListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onCreate = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/securitygroups/create.html'});
		
	}
	
	$scope.onEdit = function() {
		
		$scope.$root.$broadcast('modal.show',{view : 'app/compute/views/securitygroups/edit.html'});
		
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
		
		OpenStack.ajax({
			method : "GET",
			url : endpoint + "/os-security-groups"
		}).success(function(data, status, headers, config) {
			$scope.security_groups = data.security_groups;
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onRefresh();

});
compute.controller("SecurityGroupShowCtrl",function($scope, $routeParams, OpenStack) {
	
});