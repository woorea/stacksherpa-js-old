var openstack = angular.module("openstack",[]);
openstack.factory('notifications', function() {
	var notifications = {
		info : function(message) {
			$.bootstrapGrowl(message);
		},
		success : function(message) {
			$.bootstrapGrowl(message, {type : 'success'});
		},
		error : function(message) {
			$.bootstrapGrowl(message, {type : 'error'});
		},
		log : function(message) {
			console.log(message);
		},
		debug : function(message) {
			console.log(message);
		}
	}
	return notifications;
});
openstack.factory('error_handler', function(notifications) {
	
	return {
		compute : function(data, status, headers, config) {
			try {
				if(data.badRequest) {
					notifications.error(data.badRequest.message);
				} else if (data.overLimit) {
					notifications.error(data.overLimit.message);
				}
			} catch(e) {
				console.log(e);
			}
		},
		identity : function(data, status, headers, config) {
			try {
		        if(data.error) {
		        	notifications.error(data.error.message);
		        }
			} catch(e) {
		        console.log(e);
			}
		}
	}
})
openstack.factory("OpenStack", function($http, $cacheFactory, error_handler) {
	
	var topics = {};
	
	var os = {
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
			sessionStorage.setItem("provider", angular.toJson(provider));
		},
		getProvider : function() {
			var provider = sessionStorage.getItem("provider");
			return provider != null ? angular.fromJson(provider) : provider;
		},
		setAccess : function(access) {
			sessionStorage.setItem("access", angular.toJson(access));
		},
		getAccess : function() {
			var access = sessionStorage.getItem("access");
			try {
				return angular.fromJson(access)
			} catch(e) {
				return null;
			}
		},
		setTenants : function(tenants) {
			sessionStorage.setItem("tenants", angular.toJson(tenants));
		},
		getTenants : function() {
			var tenants = sessionStorage.getItem("tenants");
			return tenants != null ? angular.fromJson(tenants) : tenants;
		},
		reload : function() {
			return this.getAccess() != null;
		},
		logout : function() {
			sessionStorage.removeItem("provider");
			sessionStorage.removeItem("access");
			sessionStorage.removeItem("tenants");
		},
		compute : {},
		storage : {},
		broadcast : function(topic_name, message) {
			var subscribers = topics[topic_name]
			if(subscribers) {
				_.each(subscribers, function(fn) {
					fn.call(undefined, message);
				});
			}
		},
		on : function(topic_name, fn) {
			var subscribers = topics[topic_name]
			if(!subscribers) {
				subscribers = topics[topic_name] = []
			}
			subscribers.push(fn);
			return function() {
				bus.broadcast('notification.debug', 'Unregister subscribers of ' + topic_name + ' topic.')
				_.reject(subscribers, function(subscriber) {
					fn == subscriber;
				});
			}
		},
		pollers : {},
		poller : function(name, fn, interval) {
			OpenStack.pollers[name] = $timeout(function poll() {
				fn();
				OpenStack.pollers[name] = $timeout(poll, interval)
			}, interval);
		},
		authenticate : function(auth) {
			var url = os.getProvider().identity.endpoints[0].publicURL + "/tokens";
			os.ajax({method : "POST", url : url, data : auth})
				.success(function(data, status, headers, config) {
					os.setAccess(data.access);
					os.broadcast("access", data.access);
				})
				.error(error_handler.identity);
		},
		listTenants : function(opts) {
			opts.method = 'GET'
			opts.url = os.getProvider().identity.endpoints[0].publicURL + "/tenants";
			os.ajax(opts)
				.success(function(data, status, headers, config) {
					if(!angular.isArray(data.tenants)) {
						//weird json from trystack
						data.tenants = data.tenants.values;
					}
					os.setTenants(data.tenants);
					os.broadcast("tenants", data.tenants);
				})
				.error(error_handler.identity);
		},
		error_handler : error_handler
	}
	
	return os;

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


var default_compute_options = {
	service: "compute",
	facing : "publicURL",
	method : "GET"
}

openstack.run(function(OpenStack, bus, notifications, error_handler) {
	
	var flavors_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/flavors/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavors);
			}).error(error_handler.compute);
			
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/flavors/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavor);
			}).error(error_handler.compute);
			
		},
		create : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {method : "POST", path : "/flavors"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavor);
			}).error(error_handler.compute);
			
		},
		delete : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {method : "DELETE", path : "/flavors/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success();
			}).error(error_handler.compute);
		}
	}
	
	var images_api = {
		
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/images/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.images);
			}).error(error_handler.compute);
		},
		create : function(region, image) {
			
			var endpoint = OpenStack.endpoint("image", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/images",
				data : image
			}).success(function(data, status, headers, config) {
				OpenStack.broadcast("image", data);
			}).error(function(data, status, headers, config) {
				alert('show image error');
			});
			
		},
		patch : function(service, region, id, op, key, value) {
			
			var endpoint = OpenStack.endpoint(service, region, "publicURL");
			
			var data = {}
			data[op] = '/' + key
			if(op != 'remove') { //add, replace
				data.value = value;
			}
			
			console.info(data);
			
			
			OpenStack.ajax({
				method : "PATCH",
				url : endpoint + "/images/" + id,
				headers : {
					"Content-Type" : "application/openstack-images-v2.0-json-patch"
				},
				data : [ data ]
			}).success(function(data, status, headers, config) {
				OpenStack.broadcast("image", data);
			}).error(function(data, status, headers, config) {
				alert('show image error');
			});
		},
		show : function(service, region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint(service, region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/images/" + id,
				refresh : true
			}).success(function(data, status, headers, config) {
				OpenStack.broadcast("image", data);
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
			
			notifications.info('server.list.start');
			
			var options = angular.extend({}, default_compute_options, {path : "/servers/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				OpenStack.broadcast('servers', data.servers);
				notifications.success('server.list.success')
			}).error(error_handler.compute);
			
		},
		create : function(region, server, callback) {
			
			notifications.info('server.create.start');
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				notifications.info('server.create.success');
				callback(data.server);
			}).error(error_handler.compute);
		},
		show : function(opts) {
			
			notifications.info('server.show.start');
			
			var options = angular.extend({}, default_compute_options, {path : "/servers/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				var server = data.server;
				if(server.status && server.status == 'ACTIVE' || server.status == 'CONFIRM_RESIZE') {
					console.log('cancel poll');
					var poller = OpenStack.pollers[server.id];
					if(poller) {
						$timeout.cancel(poller);
					}
				}
				notifications.success('server.show.success');
				OpenStack.broadcast('server', server);
			}).error(error_handler.compute);
		},
		delete : function(region, id, callback) {
			
			notifications.info('server.'+id+'.delete.start');
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id
			}).success(function(data, status, headers, config) {
				console.log(data);
				if(!_.isUndefined(callback)) {
					callback(data);
				}
				notifications.success('server.'+id+'.delete.end');
			}).error(error_handler.compute);
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
			}).error(error_handler.compute);
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
			}).error(error_handler.compute);
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
			}).error(error_handler.compute);
		}
	}
	
	var networks_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-networks"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				OpenStack.broadcast('networks', data.networks);
			}).error(error_handler.compute);
		}
	}
	
	var floating_ips_api = {
		listPools : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-floating-ip-pools"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.floating_ip_pools);
			}).error(error_handler.compute);
		},
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-floating-ips"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.floating_ips);
			}).error(error_handler.compute);
		},
		allocate : function(region, data, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-floating-ips",
				data : data
			}).success(function(data, status, headers, config) {
				callback();
			}).error(error_handler.compute);
		},
		deallocate : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-floating-ips/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(error_handler.compute);
		}
	}
	
	var volumes_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-volumes/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.volumes);
			}).error(error_handler.compute);
			
		},
		create : function(region, volume, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-volumes",
				data : {volume : volume}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(error_handler.compute);
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
			}).error(error_handler.compute);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-volumes/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(error_handler.compute);
		}
	}
	
	var snapshots_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-snapshots/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.snapshots);
			}).error(error_handler.compute);
			
		},
		create : function(region, snapshot, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-snapshots",
				data : {snapshot : snapshot}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(error_handler.compute);
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
			}).error(error_handler.compute);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-snapshots/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(error_handler.compute);
		}
	};
	
	var keypairs_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-keypairs"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success($.map(data.keypairs, function(el,idx) {
					return el.keypair;
				}));
			}).error(error_handler.compute);
		},
		create : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-keypairs",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(error_handler.compute);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-keypairs/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(error_handler.compute);
		}
	};
	
	var security_groups_api = {
		
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-security-groups"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.security_groups)
			}).error(error_handler.compute);
		},
		create : function(region, security_group, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-groups",
				data : {security_group : security_group}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(error_handler.compute);
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-security-groups/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.security_group);
			}).error(error_handler.compute);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-groups/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(error_handler.compute);
		},
		addRule : function(region, id, rule, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-group-rules",
				data : { security_group_rule : rule }
			}).success(function(data, status, headers, config) {
				callback(data.security_group_rule);
			}).error(error_handler.compute);
		},
		removeRule : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-group-rules/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(error_handler.compute);
		}
	};
	
	var certificates_api = {
		create : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-certificates"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				OpenStack.broadcast('certificate', data.certificate);
			}).error(error_handler.compute);
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-certificates/root"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				OpenStack.broadcast('certificate', data.certificate);
			}).error(error_handler.compute);
		}
	};
	
	var hosts_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-hosts"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				OpenStack.broadcast('hosts', data.hosts);
			}).error(error_handler.compute);
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-hosts/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				OpenStack.broadcast('host', data.host);
			}).error(error_handler.compute);
		}
	};
	
	angular.extend(OpenStack, {
		Flavors : flavors_api,
		Images : images_api,
		Servers : servers_api,
		Networks : networks_api,
		FloatingIps : floating_ips_api,
		Volumes : volumes_api,
		Snapshots : snapshots_api,
		KeyPairs : keypairs_api,
		SecurityGroups : security_groups_api,
		Certificates : certificates_api,
		Hosts : hosts_api
	});
	
});
