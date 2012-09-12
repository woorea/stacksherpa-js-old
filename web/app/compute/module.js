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
		
		angular.forEach($scope.volumes, function(server) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/servers/" + server.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
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
	
	$scope.$on('servers.refresh', function(event, args) {
		$scope.onRefresh();
	})
	
	$scope.onRefresh();

});
compute.controller("ServerShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

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
	
	$scope.onCreateImage = function() {
		alert('create image');
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
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
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

compute.controller("ServerShowVncConsoleCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	OpenStack.ajax({
		method : "POST",
		url : endpoint + "/servers/" + $routeParams.id + "/action",
		data : {
			"os-getVNCConsole" : {
				type : "novnc"
			}
		}
	}).success(function(data, status, headers, config) {
		$scope.console = data.console;
	}).error(function(data, status, headers, config) {

	});
	
});

compute.controller("ServerShowConsoleOutputCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onRefresh = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"os-getConsoleOutput" : {
					length : 100
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.output = data.output;
			//$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	
	
	$scope.onRefresh();
	
});

compute.controller("ServerCreateImageCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
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
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.resize = {
		flavorRef : "",
		diskConfig : ""
	}
	
	$scope.onResize = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : { "resize" : $scope.resize }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerRebuildCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
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
	
	$scope.onRebuildServer = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : { "rebuild" : $scope.server }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {
			
		});
		
	}
	
});

compute.controller("ServerChangePasswordCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onChangePassword = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"changePassword" : {
					adminPass : $scope.adminPass
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});

compute.controller("ServerBackupCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.backup = {
		name : "",
		backup_type : "",
		rotation : "",
		metadata : {
			"k" : "v"
		}
	}
	
	$scope.onCreateBackup = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $routeParams.id + "/action",
			data : {
				"createBackup" : $scope.backup
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
	$scope.onAddMetadata = function() {
		$scope.backup.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.backup.metadata[key]
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
		
		angular.forEach($scope.images, function(image) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/servers/" + image.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
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
	
	$scope.$on('images.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
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

	$scope.onDelete = function() {
		
		angular.forEach($scope.flavors, function(flavor) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/flavors/" + flavor.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
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
	
	$scope.$on('flavors.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
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
compute.controller("FlavorCreateCtrl",function($scope, $routeParams, OpenStack) {
});
compute.controller("FloatingIpListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onDisassociate = function(floatingIp) {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $scope.server.id + "/action",
			data : {
				removeFloatingIp : {
					address : floatingIp.address
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.onRefresh();
		}).error(function(data, status, headers, config) {

		});
	}

	$scope.onDeallocate = function() {
		
		angular.forEach($scope.floating_ips, function(fip) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/os-floating-ips/" + fip.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
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
	
	$scope.$on('floating-ips.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("AllocateFloatingIpCtrl", function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/os-floating-ip-pools"
	}).success(function(data, status, headers, config) {
		$scope.pools = data.pools;
	}).error(function(data, status, headers, config) {

	});
	
	$scope.onAllocate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-floating-ips",
			data : {
				pool : $scope.pool
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

compute.controller("AssociateFloatingIpCtrl", function($scope, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/servers/detail"
	}).success(function(data, status, headers, config) {
		$scope.servers = data.servers;
	}).error(function(data, status, headers, config) {

	});
	
	$scope.onAssociate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $scope.server.id + "/action",
			data : {
				addFloatingIp : {
					address : $routeParams.address
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}

});

compute.controller("VolumeListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onDelete = function() {
		
		angular.forEach($scope.volumes, function(volume) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/os-volumes/" + volume.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
	}
	
	$scope.onDetach = function() {
		
		angular.forEach($scope.volumes, function(volume) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/servers/" + volume.serverId + "/os-volume_attachments/" + volume.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
		
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
	
	$scope.$on('volumes.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();
	
});
compute.controller("VolumeShowCtrl",function($scope, $routeParams, OpenStack) {
	
});
compute.controller("VolumeCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.volume = {
		"display_name": "vol-001",
		"display_description": "Another volume.",
		"size": 30,
		"volume_type": "289da7f8-6440-407c-9fb4-7db01ec49164",
		"metadata": {"contents": "junk"},
		"availability_zone": "us-east1"
	}
	
	$scope.onCreate = function() {
		$scope.$root.$broadcast('modal.hide');
	}
	
});
compute.controller("VolumeAttachCtrl",function($scope, $routeParams, OpenStack) {
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	OpenStack.ajax({
		method : "GET",
		url : endpoint + "/servers/detail"
	}).success(function(data, status, headers, config) {
		$scope.servers = data.servers;
	}).error(function(data, status, headers, config) {

	});
	
	$scope.onAttach = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/servers/" + $scope.server.id + "/action",
			data : {
				addFloatingIp : {
					address : $routeParams.address
				}
			}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
});
compute.controller("SnapshotListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function() {
		
		angular.forEach($scope.volumes, function(volume) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/os-snapshots/" + volume.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
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
	
	$scope.$on('snapshots.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

	
	
});
compute.controller("SnapshotShowCtrl",function($scope, $routeParams, OpenStack) {
});
compute.controller("SnapshotCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.snapshot = {
		"display_name": "snap-001",
		"display_description": "Daily backup",
		"volume_id": "521752a6-acf6-4b2d-bc7a-119f9148cd8c",
		"force": true
	}
	
	$scope.onCreate = function() {
		$scope.$root.$broadcast('modal.hide');
	}
	
});
compute.controller("KeyPairListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function() {
		
		angular.forEach($scope.keypairs, function(keypair) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/os-keypairs/" + keypair.name
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
		
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
	
	$scope.$on('keypairs.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("KeyPairCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.keypair = {
		name: "testkeypair",
		public_key: "ssh-rsa  AAAB3NzaC1yc2EAAAADAQABAAAAgQDS75K9dCGNb8wUIqSRT8UZU1riwaMBXViZ6m7hvRi9adVJrNzUQVJEYotqGXpe4rwC7iCfwmVxWj/wu/h4OOoBqdkQcQMcuggMpNvnymhwUfj6vg+zEOpFcZg1mY3dvMoDnnUAClLB8/ELY1FtKTyTJyKJN7yyR4WkMN5H4BR/Lw== nova@az1-nv-schedule-0000"
	}
	
	$scope.onUpload = function() {
		
	}
	
	$scope.onCreate = function() {
		
	}
	
});
compute.controller("SecurityGroupListCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");

	$scope.onDelete = function() {
		
		angular.forEach($scope.security_groups, function(sg) {
			if(fip.checked) {
				OpenStack.ajax({
					method : "DELETE",
					url : endpoint + "/security-groups/" + sg.id
				}).success(function(data, status, headers, config) {
					//$scope.floating_ips = data.floating_ips;
				}).error(function(data, status, headers, config) {

				});
			}
		});
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
	
	$scope.$on('security-groups.refresh', function(event, args) {
		$scope.onRefresh();
	});
	
	$scope.onRefresh();

});
compute.controller("SecurityGroupShowCtrl",function($scope, $routeParams, OpenStack) {
	
});
compute.controller("SecurityGroupCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.security_group = {
		name : "name",
		description : "description"
	}
	
	$scope.onCreate = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-security-groups",
			data : { security_group : $scope.security_group }
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
});