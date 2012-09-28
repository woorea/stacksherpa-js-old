var compute = angular.module("compute",['compute.directives','compute.filters']);
compute.config(function($routeProvider) {
	$routeProvider
		.when("/:tenant/compute/:region/servers", {
			controller : "ServerListCtrl", templateUrl : "app/compute/views/servers/list.html", menu : "servers"
		})
		.when("/:tenant/compute/:region/servers/:id", {
			controller : "ServerShowCtrl", templateUrl : "app/compute/views/servers/show.html", menu : "servers"
		})
		.when("/:tenant/compute/:region/images", {
			controller : "ImageListCtrl", templateUrl : "app/compute/views/images/list.html", menu : "images"
		})
		.when("/:tenant/compute/:region/images/:id", {
			controller : "ImageShowCtrl", templateUrl : "app/compute/views/images/show.html", menu : "images"
		})
		.when("/:tenant/compute/:region/flavors", {
			controller : "FlavorListCtrl", templateUrl : "app/compute/views/flavors/list.html", menu : "flavors"
		})
		.when("/:tenant/compute/:region/flavors/:id", {
			controller : "FlavorShowCtrl", templateUrl : "app/compute/views/flavors/show.html", menu : "flavors"
		})
		.when("/:tenant/compute/:region/floating-ips", {
			controller : "FloatingIpListCtrl", templateUrl : "app/compute/views/floatingips/list.html", menu : "floating-ips"
		})
		.when("/:tenant/compute/:region/volumes", {
			controller : "VolumeListCtrl", templateUrl : "app/compute/views/volumes/list.html", menu : "volumes"
		})
		.when("/:tenant/compute/:region/volumes/:id", {
			controller : "VolumeShowCtrl", templateUrl : "app/compute/views/volumes/show.html", menu : "volumes"
		})
		.when("/:tenant/compute/:region/snapshots", {
			controller : "SnapshotListCtrl", templateUrl : "app/compute/views/snapshots/list.html", menu : "snapshots"
		})
		.when("/:tenant/compute/:region/snapshots/:id", {
			controller : "SnapshotShowCtrl", templateUrl : "app/compute/views/snapshots/show.html", menu : "snapshots"
		})
		.when("/:tenant/compute/:region/key-pairs", {
			controller : "KeyPairListCtrl", templateUrl : "app/compute/views/keypairs/list.html", menu : "key-pairs"
		})
		.when("/:tenant/compute/:region/security-groups", {
			controller : "SecurityGroupListCtrl", templateUrl : "app/compute/views/securitygroups/list.html", menu : "security-groups"
		})
		.when("/:tenant/compute/:region/security-groups/:id", {
			controller : "SecurityGroupShowCtrl", templateUrl : "app/compute/views/securitygroups/edit.html", menu : "security-groups"
		})
		.when("/:tenant/compute/:region/extensions", {
			templateUrl : "app/compute/views/common/extensions.html", menu : "extensions"
		})
		.when("/:tenant/compute/:region/limits", {
			templateUrl : "app/compute/views/common/limits.html", menu : "limits"
		})
		.when("/:tenant/compute/:region/usage", {
			templateUrl : "app/compute/views/common/usage.html", menu : "usage"
		})
		.when("/:tenant/compute/:region", { redirectTo : function(routeParams, locationPath, locationSearch) {
			return locationPath + "/servers";
		}})
});
compute.controller("ComputeCtrl",function($scope, $location, $routeParams, $q, OpenStack) {
	
	$scope.access = OpenStack.getAccess();
	
	$scope.endpoint = OpenStack.endpoint("compute", $routeParams.region, "publicURL");
	
	var extensions_promise = OpenStack.ajax({
		method : 'GET',
		url : $scope.endpoint + '/extensions'
	}).success(function(data, status, headers, config) {
		$scope.extensions = data.extensions;
	});
	
	$scope.hasRole = function(name) {
		return _.include(_.pluck($scope.access.user.roles, 'name'), name);
	}
	
	extensions_promise.then(function() {
		
		
		
		//now i can paint the menu
		
		$scope.loaded = true;
		
		$scope.hasExtension = function(alias) {
			
			
			return _.find($scope.extensions, function(ext) {
				return ext.alias == alias;
			});

		}
		
	});
	
});
compute.controller("ServerListCtrl",function($scope, $routeParams, $timeout, OpenStack) {

	$scope.delete_checked = function(servers) {
		_.each(servers, function(server) {
			if(server.checked) {
				OpenStack.Servers.delete($routeParams.region, server.id)
			}
		});
		OpenStack.broadcast('delete.success');
	}

	$scope.refresh = function(sync) {
		OpenStack.Servers.list({region : $routeParams.region, refresh : sync});
	}
	
	OpenStack.on('server', function(server) {
		var add_server = true;
		_.each($scope.servers, function(scope_server) {
			if(scope_server.id == server.id) {
				scope_server = server;
				add_server = false;
			}
		});
		if(add_server) {
			$scope.servers.unshift(server);
		}
	});
	
	OpenStack.on('servers', function(servers) {
		_.each(servers, function(server) {
			OpenStack.Images.show("compute", $routeParams.region, server.image.id, server);
			OpenStack.Flavors.show({region : $routeParams.region, id : server.flavor.id, success : function(flavor) {
				server.flavor = flavor;
			}});
		});
		$scope.servers = servers;
	});
	
	/*
	var poller = function() {
		$timeout(function poll() {
			fn();
			$timeout(poll, interval)
		}, interval);
	}
	*/
	
	OpenStack.on('delete.success', function() {
		$timeout(function() { $scope.refresh(true) }, 5000);
	});
	
	$scope.refresh(false);

});
compute.controller("ServerShowCtrl",function($scope, $routeParams, $location, bus, OpenStack) {
	
	OpenStack.on('server', function(server) {
		OpenStack.Images.show("compute", $routeParams.region, server.image.id, server);
		OpenStack.Flavors.show({region : $routeParams.region, id : server.flavor.id, success : function(flavor) {
			server.flavor = flavor;
		}});
		$scope.server = server;
		if(_.include(['BUILD','RESIZE','REVERT_RESIZE','REBUILD'], $scope.server.status)) {
			setTimeout(function() {
				$scope.onRefresh(true);
			}, 15000);
		}
	});
	
	OpenStack.on('delete.success', function() {
		$timeout(function() { 
			$location.path("/" + $routeParams.tenant + "/compute/" + $routeParams.region + "/servers");
		}, 5000);
	});
	
	$scope.refresh = function(sync) {
		OpenStack.Servers.show({region : $routeParams.region, id : $routeParams.id, refresh : sync});
	}
	
	$scope.refresh(false);

});
compute.controller("ServerRebootCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onReboot = function() {
		OpenStack.Servers.action($routeParams.region, $routeParams.id, {
			reboot : {
				type : $scope.type
			}
		}, function(data) {
			$scope.$root.$broadcast('server.refresh');
			$scope.$root.$broadcast('modal.hide');
		});
	}
	
});

compute.controller("ServerShowVncConsoleCtrl", function($scope, $routeParams, OpenStack) {
	
	OpenStack.Servers.action($routeParams.region, $routeParams.id, {
		"os-getVNCConsole" : {
			type : "novnc"
		}
	}, function(data) {
		$scope.console = data.console;
	});
	
});

compute.controller("ServerShowConsoleOutputCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onRefresh = function() {
		
		OpenStack.Servers.action($routeParams.region, $routeParams.id, {
			"os-getConsoleOutput" : {
				length : 100
			}
		}, function(data) {
			$scope.output = data.output;
		});
		
	}
	
	$scope.onRefresh();
	
});

compute.controller("ServerResizeCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.resize = {
		auto_disk_config : $scope.server['OS-DCF:diskConfig'] == 'AUTO'
	}
	
	$scope.onResize = function() {
		$scope.resize.flavorRef = $scope.flavors[$scope.selected_flavor_index].id;
		OpenStack.Servers.action($routeParams.region, $routeParams.id, { "resize" : $scope.resize }, function(data) {
			$scope.$root.$broadcast('server.refresh');
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
	OpenStack.Flavors.list({region : $routeParams.region, success : function(flavors) {
		$scope.flavors = flavors;
		_.each(flavors, function(f,index) {
			if(f.id == $scope.server.flavor.id) {
				$scope.selected_flavor_index = index;
			}
		})
	}});
	
});

compute.controller("ServerRebuildCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.steps = [
		{title : "Select an image", src : "app/compute/views/servers/launch-select-image.html"},
		{title : "Configuration", src : "app/compute/views/servers/rebuild-configuration.html"},
		{title : "Server metadata", src : "app/compute/views/servers/launch-metadata.html"},
		{title : "Server personality", src : "app/compute/views/servers/rebuild-summary.html"}
	]
	
	var server_id = $scope.server.id
	
	$scope.server = {
		name : $scope.server.name,
		adminPass : "",
		//accessIPv4 : "",
		//accessIPv6 : "",
		metadata : $scope.server.metadata,
		personality : [],
		auto_disk_config : $scope.server['OS-DCF:diskConfig'] == 'AUTO'
	}
	
	OpenStack.Images.list({service : "compute", region : $routeParams.region, success : function(images) {
		$scope.images = images;
	}});
	
	$scope.onSelectImage = function(image) {
		$scope.selected_image = image;
		$scope.on_next();
	}
	
	$scope.onRebuild = function() {
		$scope.server.imageRef = $scope.selected_image.id;
		OpenStack.Servers.action($routeParams.region, $routeParams.id, { "rebuild" : $scope.server }, function(data) {
			$scope.$root.$broadcast('server.refresh');
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});

compute.controller("ServerChangePasswordCtrl", function($scope, $routeParams, OpenStack) {
	
	$scope.onChangePassword = function() {
		
		OpenStack.Servers.action($routeParams.region, $routeParams.id, {
			"changePassword" : {
				adminPass : $scope.adminPass
			}
		}, function(data) {
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});

compute.controller("ServerCreateImageCtrl", function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.image = {
		name : $scope.server.name + " (Image)",
		metadata : {}
	}
	
	$scope.onCreateImage = function() {
		
		OpenStack.Servers.action($routeParams.region, $routeParams.id, { "createImage" : $scope.image }, function(data) {
			$scope.$root.$broadcast('modal.hide');
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
		
		OpenStack.Servers.action($routeParams.region, $routeParams.id, { "createBackup" : $scope.backup }, function(data) {
			$scope.$root.$broadcast('modal.hide');
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

compute.controller("ServerLaunchCtrl", function($scope, $routeParams, $timeout, OpenStack) {
	
	$scope.wizard = {
		steps : [
			{title : "Select an image", src : "app/compute/views/servers/launch-select-image.html"},
			{title : "Select a flavor", src : "app/compute/views/servers/launch-select-flavor.html"},
			{title : "Configuration", src : "app/compute/views/servers/launch-configuration.html"},
			{title : "Server metadata", src : "app/compute/views/servers/launch-metadata.html"},
			{title : "Server personality", src : "app/compute/views/servers/launch-personality.html"}
		],
		success : {title : "Success", src : "app/compute/views/servers/launch-success.html"}
	}
	
	if($scope.hasExtension('os-keypairs') || $scope.hasExtension('os-security-groups')) {
		$scope.wizard.steps.push({title : "Security", src : "app/compute/views/servers/launch-security.html"});
	}
	
	$scope.wizard.steps.push({title : "Summary", src : "app/compute/views/servers/launch-summary.html"});
	
	
	$scope.keyPairs = []
	$scope.securityGroups = []
	
	$scope.server = {
		metadata : {},
		personality : [],
		security_groups : [],
		min_count : 1,
		max_count : 1,
		'OS-DCF:diskConfig' : 'AUTO'
	}
	
	$scope.onLaunch = function() {
		$scope.server.imageRef = $scope.selected_image.id;
		$scope.server.flavorRef = $scope.flavors[$scope.selected_flavor_index].id;
		_.each($scope.selected_security_groups, function(sg) {
			$scope.server.security_groups.push({name : sg.name});
		});
		OpenStack.Servers.create($routeParams.region, $scope.server, function(server) {
			if(server.adminPass) {
				$scope.adminPass = server.adminPass;
				$scope.on_wizard_success();
				OpenStack.poller(
					server.id,
					OpenStack.Servers.show({region : $routeParams.region, id : server.id, refresh : true}),
					3000
				);
			}
		});
	}
	
	OpenStack.Images.list({service : "compute", region : $routeParams.region, success : function(images) {
		$scope.images = images;
	}});
	
	OpenStack.Flavors.list({region : $routeParams.region, success : function(flavors) {
		$scope.flavors = flavors;
		$scope.selected_flavor_index = 0;
	}});
	
	OpenStack.KeyPairs.list({region : $routeParams.region, success : function(keypairs) {
		$scope.keyPairs = keypairs;
	}});
	OpenStack.SecurityGroups.list({region : $routeParams.region, success : function(security_groups) {
		$scope.securityGroups = security_groups
		$scope.selected_security_groups = [_.find(security_groups, function(sg){ return sg.name == 'default' })];
	}});
	
	$scope.onSelectImage = function(image) {
		$scope.selected_image = image;
		$scope.on_next();
	}

});
compute.controller("MetadataCtrl",function($scope) {
	
	$scope.onAddMetadata = function() {
		$scope.server.metadata[$scope.key] = $scope.value;
		$scope.key = $scope.value = ''
	}
	
	$scope.onRemoveMetadata = function(key) {
		delete $scope.server.metadata[key]
	}
	
});
compute.controller("PersonalityCtrl",function($scope) {
	
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

compute.controller("ImageListCtrl",function($scope, $routeParams, OpenStack, modal) {

	$scope.onDelete = function(image) {
		
		if(typeof image != 'undefined') {
			
			OpenStack.Images.delete($routeParams.region, image.id, function() { });
			
		} else {
			angular.forEach($scope.images, function(image) {
				if(image.checked) {
					
					OpenStack.Images.delete($routeParams.region, image.id, function() {});
					
				}
			});
		}
		setTimeout(function() {
			$scope.onRefresh(true);
		}, 2000);
	}

	$scope.onRefresh = function(sync) {
		if($scope.poller) {
			clearTimeout($scope.poller);
		}
		OpenStack.Images.list({service : "compute", region : $routeParams.region, refresh : sync, success : function(images) {
			$scope.images = images;
			var poll = images.filter(function(image) {
				return image.status == 'SAVING'
			}).length > 0;
			if(poll) {
				$scope.poller = setTimeout(function() {
					$scope.onRefresh(true);
				}, 60000);
			}
		}});

	}

	$scope.on_create = function() {
		modal.show('app/compute/views/images/create.html', $scope.$new());
	}

	$scope.$on('images.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);
	
});
compute.controller("ImageShowCtrl",function($scope, $routeParams, OpenStack) {
	
	OpenStack.Images.show($routeParams.region, $routeParams.id, $scope);
	
});

compute.controller("ImageCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("image", $routeParams.region, "publicURL");
	
	$scope.creation_method = "upload"
	
	$scope.upload_progress = 0;
	
	$scope.image = {
		"X-Auth-Token" : OpenStack.getAccess().token.id,
		"X-URI" : endpoint + "/images",
		"x-image-meta-name" : "",
		"x-image-meta-disk_format" : "qcow2",
		"x-image-meta-container_format" : "ovf",
		"x-image-meta-min-ram" : 0,
		"x-image-meta-min-disk" : 0,
		"x-image-meta-store" : "file"
	}
	
	if($scope.creation_method == 'download') {
		$scope.image["x-glance-api-copy-from"] = $scope.href;
	} else if ($scope.creation_method == 'href') {
		$scope.image["x-image-meta-location"] = $scope.href;
	}
	
	$scope.onUpload = function() {
		
		var ajaxOptions = {
			crossDomain : true,
			type: "POST",
			url : OpenStack.proxy,
			headers : $scope.image,
			data: $scope.creation_method == 'upload' ? $scope.file : "",
			dataType : "json",
			processData: false,
			contentType: "application/octet-stream",
			success: function(data) {
				$scope.$root.$broadcast('images.refresh');
				$scope.$root.$broadcast('modal.hide');
			},
			error: function(data) {
				console.log(data);
			}
		}
		
		if ($scope.creation_method == 'upload') {
			$scope.image["x-image-meta-size"] = $scope.file.size;
			ajaxOptions.xhr = function() {
				var xhr = new window.XMLHttpRequest();
			    //Upload progress
			    xhr.upload.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
					$scope.$apply(function() {
						$scope.upload_progress = Math.floor((evt.loaded / evt.total) * 100);
					});
			      }
			    }, false);
			    //Download progress
			    xhr.addEventListener("progress", function(evt){
			      if (evt.lengthComputable) {
			        var percentComplete = evt.loaded / evt.total;
			        //Do something with download progress
			        console.log(percentComplete);
			      }
			    }, false);
			    return xhr;
			}
		}
		
		$.ajax(ajaxOptions)
	}
	
});

compute.controller("FlavorListCtrl",function($scope, $routeParams, OpenStack, modal) {

	$scope.onDelete = function(flavor) {
		
		if(typeof flavor != 'undefined') {
			
			OpenStack.Flavors.delete({region : $routeParams.region, id : flavor.id, success : function() {
				$scope.onRefresh();
			}});
			
		} else {
			angular.forEach($scope.flavors, function(flavor) {
				if(flavor.checked) {
					
					OpenStack.Flavors.delete({region : $routeParams.region, id : flavor.id, success : function() {
						$scope.onRefresh();
					}});
					
				}
			});
		}
	}
	
	$scope.on_create = function() {
		modal.show('app/compute/views/flavors/create.html', $scope.$new());
	}

	$scope.onRefresh = function(sync) {
		OpenStack.Flavors.list({region : $routeParams.region, refresh : sync, success : function(flavors) {
			$scope.flavors = flavors;
		}});
	}
	
	$scope.$on('flavors.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

});
compute.controller("FlavorShowCtrl",function($scope, $routeParams, OpenStack) {
	
	OpenStack.Flavors.show({region : $routeParams.region, id : $routeParams.id, success : function(flavor) {
		$scope.flavor = flavor;
	}});
	
});
compute.controller("FlavorCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.flavor = {
		name : "",
		ram : 1024,
		vcpus : 2,
		disk : 10
	}
	
	$scope.create = function() {
		
		OpenStack.Flavors.create({region : $routeParams.region, data : {
			flavor : $scope.flavor
		}, success : function(data) {
			$scope.$root.$broadcast('flavors.refresh');
			$scope.$root.$broadcast('modal.hide');
		}});

	}
	
});
compute.controller("FloatingIpListCtrl",function($scope, $routeParams, OpenStack, modal) {
	
	$scope.on_allocate = function() {
		modal.show('app/compute/views/floatingips/allocate.html', $scope.$new())
	}
	
	$scope.onDisassociate = function(floatingIp) {
		
		if(floatingIp) {
			
			OpenStack.Servers.action($routeParams.region, floatingIp.instance_id, {
				removeFloatingIp : {
					address : floatingIp.ip
				}
			}, function(data) { });
			
		} else {
			angular.forEach($scope.floating_ips, function(floatingIp) {
				
				OpenStack.Servers.action($routeParams.region, floatingIp.instance_id, {
					removeFloatingIp : {
						address : floatingIp.ip
					}
				}, function(data) { });
				
			});
		}
		setTimeout(function() {
			$scope.onRefresh(true);
		}, 15000);
	}

	$scope.onDeallocate = function(floatingIp) {
		
		if(floatingIp) {
			
			OpenStack.FloatingIps.deallocate($routeParams.region, floatingIp.id, function(data) {
				$scope.onRefresh(true);
			});
			
		} else {
			angular.forEach($scope.floating_ips, function(floatingIp) {
				if(floatingIp.checked) {
					OpenStack.FloatingIps.deallocate($routeParams.region, floatingIp.id, function(data) {
						
					});
				}
			});
		}
	}

	$scope.onRefresh = function(sync) {
		
		OpenStack.FloatingIps.list({region : $routeParams.region, refresh : sync, success : function(floating_ips) {
			$scope.floating_ips = floating_ips;
		}});
		
	}
	
	$scope.$on('floating-ips.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

});
compute.controller("FloatingIpAllocateCtrl", function($scope, $routeParams, OpenStack) {
	
	OpenStack.FloatingIps.listPools({region : $routeParams.region, success : function(floating_ip_pools) {
		$scope.floating_ip_pools = floating_ip_pools;
	}});
	
	$scope.on_associate = function() {
		modal.show('app/compute/views/floatingips/associate.html', $scope.$new());
	}
	
	$scope.onAllocate = function() {
		
		OpenStack.FloatingIps.allocate($routeParams.region, {
			pool : $scope.pool
		}, function(data) {
			$scope.hide();
			$scope.onRefresh(true);
		});
	}

});

compute.controller("FloatingIpAssociateCtrl", function($scope, $routeParams, OpenStack) {
	
	OpenStack.Servers.list({region : $routeParams.region});
	
	OpenStack.on('servers', function(servers) {
		$scope.servers = servers;
	});
	
	$scope.onAssociate = function() {
		
		OpenStack.Servers.action($routeParams.region, $scope.serverId, {
			addFloatingIp : {
				address : $scope.floating_ips[0].ip
			}
		}, function(data) {
			$scope.hide();
			$scope.onRefresh(true);
		})
		
	}

});

compute.controller("VolumeListCtrl",function($scope, $routeParams, OpenStack, modal) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.onDelete = function(volume) {
		
		if(typeof volume != 'undefined') {
			
			OpenStack.Volumes.delete($routeParams.region, volume.id, function() {
				$scope.onRefresh(true);
			});
			
		} else {
			angular.forEach($scope.volumes, function(volume) {
				if(volume.checked) {
					
					OpenStack.Volumes.delete($routeParams.region, volume.id, function() {
						
					});
					
				}
			});
		}
		
	}
	
	$scope.on_create = function() {
		modal.show("app/compute/views/volumes/create.html", $scope.$new());
	}
	
	$scope.onDetach = function(volume) {
		
		OpenStack.Servers.detach($routeParams.region, volume.attachments[0].serverId, volume.id, function() {
			$scope.onRefresh(true);
		});
		
	}

	$scope.onRefresh = function(sync) {
		
		OpenStack.Volumes.list({region : $routeParams.region, refresh : sync, success : function(volumes) {
			$scope.volumes = volumes;
		}});
		
	}
	
	$scope.$on('volumes.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);
	
});
compute.controller("VolumeShowCtrl",function($scope, $routeParams, OpenStack) {
	
});
compute.controller("VolumeCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	var snapshot_id;
	
	if(typeof $scope.snapshots != 'undefined') {
		snapshot_id = $scope.snapshots[0].id
	}
	
	$scope.volume = {
		snapshot_id : snapshot_id,
		"display_name": "vol-001",
		"display_description": "Another volume.",
		"size": 1
		//"volume_type": "289da7f8-6440-407c-9fb4-7db01ec49164",
		//"metadata": {"contents": "junk"},
		//"availability_zone": "us-east1"
	}
	
	$scope.onCreate = function() {
		
		OpenStack.Volumes.create($routeParams.region, $scope.volume, function(data) {
			$scope.$root.$broadcast('volumes.refresh');
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});
compute.controller("VolumeAttachCtrl",function($scope, $routeParams, OpenStack) {
	
	OpenStack.Servers.list({region : $routeParams.region, success : function(servers) {
		$scope.servers = servers;
	}});
	
	$scope.onAttach = function() {
		
		OpenStack.Servers.attach($routeParams.region, $scope.server_id, {
			volumeAttachment : {
				volumeId : $scope.volumes[0].id,
				device : $scope.device
			}
		}, function(data) {
			$scope.$root.$broadcast('volumes.refresh');
			$scope.$root.$broadcast('modal.hide');
		});
		
	}
	
});
compute.controller("SnapshotListCtrl",function($scope, $routeParams, OpenStack, modal) {

	$scope.onDelete = function(snapshot) {
		
		if(typeof snapshot != 'undefined') {
			
			OpenStack.Snapshots.delete($routeParams.region, snapshot.id, function(data) {
				$scope.onRefresh(true);
			});
			
		} else {
			angular.forEach($scope.snapshots, function(snapshot) {
				if(snapshot.checked) {
					OpenStack.Snapshots.delete($routeParams.region, snapshot.id, function(data) {
						
					});
				}
			});
		}
		
	}
	
	$scope.on_create_snapshot = function() {
		modal.show('app/compute/views/snapshots/create.html', $scope.$new());
	}
	
	$scope.on_create_volume = function() {
		modal.show('app/compute/views/volumes/create.html', $scope.$new());
	}

	$scope.onRefresh = function(sync) {
		
		OpenStack.Snapshots.list({region : $routeParams.region, refresh : sync, success : function(snapshots) {
			$scope.snapshots = snapshots;
		}});
		
	}
	
	$scope.$on('snapshots.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

	
	
});
compute.controller("SnapshotShowCtrl",function($scope, $routeParams, OpenStack) {
});
compute.controller("SnapshotCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	OpenStack.Volumes.list({region : $routeParams.region, refresh : true, success : function(volumes) {
		$scope.volumes = volumes;
		if($scope.volumes.length) {
			var volume_id = ""
			if(typeof $scope.volumes != 'undefined') {
				volume_id = $scope.volumes[0].id
			}

			$scope.snapshot = {
				"volume_id": volume_id,
				"display_name": "snap-002",
				"display_description": "Daily backup",
				"force": true
			}

			$scope.onCreate = function() {
				OpenStack.Snapshots.create($routeParams.region, $scope.snapshot, function(data) {
					$scope.$root.$broadcast('snapshots.refresh');
					$scope.$root.$broadcast('modal.hide');
				});
			}
		} else {
			alert('You do not have any volume yet');
			$scope.$root.$broadcast('modal.hide');
		}
	}});
	
});
compute.controller("KeyPairListCtrl",function($scope, $routeParams, OpenStack, modal) {

	$scope.onDelete = function(keypair) {
		
		if(typeof keypair != 'undefined') {
			
			OpenStack.KeyPairs.delete($routeParams.region, keypair.name, function(data) {
				$scope.onRefresh(true);
			});
			
		} else {
			angular.forEach($scope.keypairs, function(keypair) {
				if(keypair.checked) {
					OpenStack.KeyPairs.delete($routeParams.region, keypair.name, function(data) {
						$scope.onRefresh();
					});
				}
			});
		}

	}
	
	$scope.on_create = function() {
		modal.show('app/compute/views/keypairs/create.html', $scope.$new());
	}

	$scope.onRefresh = function(sync) {
		
		OpenStack.KeyPairs.list({region : $routeParams.region, refresh : sync, success : function(keypairs) {
			$scope.keypairs = keypairs;
		}});
		
	}
	
	$scope.$on('keypairs.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

});
compute.controller("KeyPairCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	var endpoint = OpenStack.endpoint("compute",$routeParams.region, "publicURL");
	
	$scope.import_keypair = {
		name: "",
		"public key": ""
	}
	
	$scope.create_keypair = {
		name: ""
	}
	
	$scope.onImport = function() {
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-keypairs",
			data : {keypair : $scope.import_keypair}
		}).success(function(data, status, headers, config) {
			$scope.$root.$broadcast('keypairs.refresh');
			$scope.$root.$broadcast('modal.hide');
		}).error(function(data, status, headers, config) {

		});
	}
	
	$scope.onCreate = function() {
		
		OpenStack.ajax({
			method : "POST",
			url : endpoint + "/os-keypairs",
			data : {keypair : $scope.create_keypair}
		}).success(function(data, status, headers, config) {
			$scope.create_keypair.public_key = data.keypair["public_key"];
			$scope.$root.$broadcast('keypairs.refresh');
		}).error(function(data, status, headers, config) {

		});
		
	}
	
});
compute.controller("SecurityGroupListCtrl",function($scope, $routeParams, OpenStack, modal) {

	$scope.onDelete = function(sg) {
		
		if(typeof sg != 'undefined') {
			
			OpenStack.SecurityGroups.delete($routeParams.region, sg.id, function(data) {
				$scope.onRefresh();
			});
			
		} else {
			angular.forEach($scope.security_groups, function(sg) {
				if(sg.checked) {
					OpenStack.SecurityGroups.delete($routeParams.region, sg.id, function(data) {
						$scope.onRefresh();
					});
				}
			});
		}
		
	}

	$scope.onRefresh = function(sync) {
		
		OpenStack.SecurityGroups.list({region : $routeParams.region, refresh : sync, success : function(security_groups) {
			$scope.security_groups = security_groups;
		}});
		
	}
	
	$scope.on_create = function() {
		modal.show('app/compute/views/securitygroups/create.html', $scope.$new());
	}
	
	$scope.$on('security-groups.refresh', function(event, args) {
		$scope.onRefresh(true);
	});
	
	$scope.onRefresh(false);

});
compute.controller("SecurityGroupShowCtrl",function($scope, $routeParams, OpenStack) {
	
	var resetAddRule = function() {
		$scope.rule = {
			"ip_protocol": "TCP",
	        "from_port": "",
	        "to_port": "",
	        "cidr": "0.0.0.0/0",
	        "group_id": null,
	        "parent_group_id": $scope.security_group.id
		}
	}
	
	$scope.onAddRule = function(rule) {
		
		OpenStack.SecurityGroups.addRule($routeParams.region, $scope.security_group.id, $scope.rule, function(security_group_rule) {
			$scope.onRefresh(true);
		})
		
		
	}
	
	$scope.onRemoveRule = function(rule) {
		
		OpenStack.SecurityGroups.removeRule($routeParams.region, rule.id, function(data) {
			$scope.onRefresh(true);
		});
	}
	
	$scope.onRefresh = function(sync) {
		OpenStack.SecurityGroups.show({region : $routeParams.region, id : $routeParams.id, refresh : sync, success : function(security_group) {
			$scope.security_group = security_group;
			resetAddRule();
		}});
	}
	
	
	$scope.onRefresh(false);
	
});
compute.controller("SecurityGroupCreateCtrl",function($scope, $routeParams, OpenStack) {
	
	$scope.security_group = {
		name : "name",
		description : "description"
	}
	
	$scope.onCreate = function() {
		OpenStack.SecurityGroups.create($routeParams.region, $scope.security_group, function(sgr) {
			$scope.$root.$broadcast('security-groups.refresh');
			$scope.$root.$broadcast('modal.hide');
		})
	}

});
compute.directive('limits', function($routeParams, OpenStack) {
	return {
		restrict : 'C',
		link : function(scope, element, attrs) {
			OpenStack.ajax({
				method : "GET",
				url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/limits'
			}).success(function(data) {
				scope.limits = data.limits;
			}).error(function(error) {
				alert(error);
			})
		}
	}
});
compute.controller("ComputeTenantUsageCtrl",function($scope, $routeParams, OpenStack) {
	
	var tenant_id = $scope.access.token.tenant.id;
	
	OpenStack.ajax({
		method : "GET",
		url : OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-quota-sets/' + tenant_id,
		refresh : true
	}).success(function(data) {
		$scope.quota_set = data.quota_set;
	}).error(function(error) {
		alert(error);
	})
	
	$scope.query = function(sync) {
		
		var url = OpenStack.endpoint("compute", "CDG", "publicURL") + '/os-simple-tenant-usage/'+tenant_id+'?detailed=1'

		if($scope.start) {
			url += '&start=' + $scope.start + 'T00:00:00';
		}
		if($scope.end) {
			url += '&endp='  + $scope.end + 'T00:00:00';
		}
		
		OpenStack.ajax({
			method : "GET",
			url : url,
			refresh : sync
		}).success(function(data) {
			$scope.tenant_usage = data.tenant_usage;
		}).error(function(error) {
			alert(error);
		})
	}
	
	$scope.query(false)
	
});