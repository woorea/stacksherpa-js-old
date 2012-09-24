var openstack = angular.module("openstack",[]);
openstack.factory("OpenStack", function($http, $cacheFactory) {
	
	return {
		proxy : stacksherpa.config.proxy || window.location.protocol + "//" + window.location.host + "/api",
		cache : $cacheFactory('openstack'),
		ajax : function(opts) {
			
			if(angular.isUndefined(opts.url)) {
				opts.url = this.endpoint(opts.service, opts.region, opts.facing) + opts.path
			}
			
			if(angular.isDefined(opts.refresh) && opts.refresh) {
				this.cache.remove(opts.url);
			}
			
			opts.cache = this.cache;
			
			opts.headers = opts.headers || {};
			
			if(this.proxy) {
				opts.headers['X-URI'] = opts.url;
				opts.url = this.proxy;
			}
			
			var access = this.getAccess()
			
			if(access) {
				opts.headers['X-Auth-Token'] = access.token.id;
			}
			
			return $http(opts)
		},
		endpoint : function(serviceType, regionName, interface) {
			var access = this.getAccess();
			if(access && angular.isArray(access.serviceCatalog)) {
				for(var i = 0; i< access.serviceCatalog.length; i++) {
					var service = access.serviceCatalog[i];
					if(service.type == serviceType) {
						for(var j = 0; j < service.endpoints.length; j++) {
							var endpoint = service.endpoints[j];
							if(angular.isDefined(endpoint.region) && endpoint.region == regionName) {
								return endpoint[interface]
							}
						}
					}
				}
			}
			return null;
		},
		setProvider : function(provider) {
			localStorage.setItem("provider", angular.toJson(provider));
		},
		getProvider : function() {
			var provider = localStorage.getItem("provider");
			return provider != null ? angular.fromJson(provider) : provider;
		},
		setAccess : function(access) {
			localStorage.setItem("access", angular.toJson(access));
		},
		getAccess : function() {
			var access = localStorage.getItem("access");
			try {
				return angular.fromJson(access)
			} catch(e) {
				return null;
			}
		},
		setTenants : function(tenants) {
			localStorage.setItem("tenants", angular.toJson(tenants));
		},
		getTenants : function() {
			var tenants = localStorage.getItem("tenants");
			return tenants != null ? angular.fromJson(tenants) : tenants;
		},
		reload : function() {
			return this.getAccess() != null;
		},
		logout : function() {
			localStorage.removeItem("provider");
			localStorage.removeItem("access");
			localStorage.removeItem("tenants");
		},
		compute : {},
		storage : {}
	}

});

openstack.directive('ssResourceList', function(OpenStack) {
	return {
		restrict : 'A',
		transclude : true,
		link : function(scope, element, attrs) {
			scope.onRefresh = function() {
				alert('refresh');
			}
			scope.onDelete = function() {
				alert('delete');
			}
		}
	}
})
openstack.factory('compute_error_handler', function(bus) {
	return {
		handler : function(data, status, headers, config) {
			try {
				if(data.badRequest) {
					bus.broadcast('notification.error', data.badRequest.message);
				}
			} catch(e) {
				console.log(e);
			}
		}
	}
})

var default_compute_options = {
	service: "compute",
	facing : "publicURL",
	method : "GET"
}

openstack.run(function(OpenStack, bus, compute_error_handler) {
	
	var flavors_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/flavors/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavors);
			}).error(compute_error_handler.handler);
			
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/flavors/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavor);
			}).error(compute_error_handler.handler);
			
		},
		create : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {method : "POST", path : "/flavors"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavor);
			}).error(compute_error_handler.handler);
			
		},
		delete : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {method : "DELETE", path : "/flavors/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success();
			}).error(compute_error_handler.handler);
		}
	}
	
	var images_api = {
		
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/images/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.images);
			}).error(compute_error_handler.handler);
		},
		
		show : function(service, region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint(service, region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/images/" + id
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.image = data.image;
				} else { //isCallback
					modelOrCallback(data.image)
				}
			}).error(function(data, status, headers, config) {
				alert('show image error');
			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/images/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
	var servers_api = {
		
		list : function(opts) {
			bus.broadcast('notification.info', 'server.list.start');
			
			var options = angular.extend({}, default_compute_options, {path : "/servers/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				bus.broadcast('servers', data.servers);
				bus.broadcast('notification.success', 'server.list.success');
			}).error(compute_error_handler.handler);
			
		},
		create : function(region, server, callback) {
			
			bus.broadcast('notification.info', 'server.list.start');
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				if(_.isUndefined(callback)) {
					bus.broadcast('servers', data.servers);
				} else {
					opts.success(data.server);
				};
				bus.broadcast('notification.success', 'server.list.success');
			}).error(compute_error_handler.handler);
		},
		show : function(opts) {
			bus.broadcast('notification.info', 'server.show.start');
			
			var options = angular.extend({}, default_compute_options, {path : "/servers/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				if(_.isUndefined(opts.success)) {
					bus.broadcast('server', data.server);
				} else {
					opts.success(data.server);
				};
				bus.broadcast('notification.success', 'server.show.success');
			}).error(compute_error_handler.handler);
		},
		delete : function(region, id, callback) {
			bus.broadcast('notification.info', 'server.'+id+'.delete.start');
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id
			}).success(function(data, status, headers, config) {
				if(!_.isUndefined(callback)) {
					callback(data);
				}
				
				bus.broadcast('notification.info', 'server.'+id+'.delete.end');
			}).error(compute_error_handler.handler);
		},
		action : function(region, id, action, callback) {
			bus.broadcast('notification.info', 'server.'+id+'.action.start');
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + id + "/action",
				data : action
			}).success(function(data, status, headers, config) {
				if(!_.isUndefined(callback)) {
					callback(data);
				}
				bus.broadcast('notification.info', 'server.'+id+'.action.success');
			}).error(compute_error_handler.handler);
		},
		attach : function(region, id, action, callback) {
			bus.broadcast('notification.info', 'server.'+id+'.attach.start');
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + id + "/os-volume_attachments",
				data : action
			}).success(function(data, status, headers, config) {
				if(!_.isUndefined(callback)) {
					callback();
				}
				bus.broadcast('notification.info', 'server.'+id+'.action.end');
			}).error(compute_error_handler.handler);
		},
		detach : function(region, id, volume_id, callback) {
			bus.broadcast('notification.info', 'server.'+id+'.detach.start');
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");

			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id + "/os-volume_attachments/" + volume_id
			}).success(function(data, status, headers, config) {
				if(!_.isUndefined(callback)) {
					callback();
				}
				bus.broadcast('notification.info', 'server.'+id+'.detach.end');
			}).error(compute_error_handler.handler);
		}
	}
	
	var floating_ips_api = {
		listPools : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-floating-ip-pools"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.floating_ip_pools);
			}).error(compute_error_handler.handler);
		},
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-floating-ips"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.floating_ips);
			}).error(compute_error_handler.handler);
		},
		allocate : function(region, data, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-floating-ips",
				data : data
			}).success(function(data, status, headers, config) {
				callback();
			}).error(compute_error_handler.handler);
		},
		deallocate : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-floating-ips/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(compute_error_handler.handler);
		}
	}
	
	var volumes_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-volumes/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.volumes);
			}).error(compute_error_handler.handler);
			
		},
		create : function(region, volume, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-volumes",
				data : {volume : volume}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(compute_error_handler.handler);
		},
		show : function(region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-volumes/" + id
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.volume = data.volume;
				} else { //isCallback
					modelOrCallback(data.volume)
				}
			}).error(compute_error_handler.handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-volumes/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(compute_error_handler.handler);
		}
	}
	
	var snapshots_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-snapshots/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.snapshots);
			}).error(compute_error_handler.handler);
			
		},
		create : function(region, snapshot, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-snapshots",
				data : {snapshot : snapshot}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(compute_error_handler.handler);
		},
		show : function(region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-snapshots/" + id
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.snapshots = data.snapshots;
				} else { //isCallback
					modelOrCallback(data.snapshots)
				}
			}).error(compute_error_handler.handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-snapshots/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(compute_error_handler.handler);
		}
	};
	
	var keypairs_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-keypairs"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success($.map(data.keypairs, function(el,idx) {
					return el.keypair;
				}));
			}).error(compute_error_handler.handler);
		},
		create : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-keypairs",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(compute_error_handler.handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-keypairs/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(compute_error_handler.handler);
		}
	};
	
	var security_groups_api = {
		
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-security-groups"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.security_groups)
			}).error(compute_error_handler.handler);
		},
		create : function(region, security_group, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-groups",
				data : {security_group : security_group}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(compute_error_handler.handler);
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-security-groups/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.security_group);
			}).error(compute_error_handler.handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-groups/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(compute_error_handler.handler);
		},
		addRule : function(region, id, rule, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-group-rules",
				data : { security_group_rule : rule }
			}).success(function(data, status, headers, config) {
				callback(data.security_group_rule);
			}).error(compute_error_handler.handler);
		},
		removeRule : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-group-rules/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(compute_error_handler.handler);
		}
	};
	
	angular.extend(OpenStack, {
		Flavors : flavors_api,
		Images : images_api,
		Servers : servers_api,
		FloatingIps : floating_ips_api,
		Volumes : volumes_api,
		Snapshots : snapshots_api,
		KeyPairs : keypairs_api,
		SecurityGroups : security_groups_api
	});
	
});
