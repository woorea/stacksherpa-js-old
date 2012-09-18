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

var default_error_handler = function(data, status, headers, config) { 
	console.log(data);
	console.log(status);
	console.log(headers);
	console.log(config);
}

var default_compute_options = {
	service: "compute",
	facing : "publicURL",
	method : "GET"
}

openstack.run(function(OpenStack) {
	
	var flavors_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/flavors/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavors);
			}).error(default_error_handler);
			
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/flavors/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavor);
			}).error(default_error_handler);
			
		},
		create : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {method : "POST", path : "/flavors"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.flavor);
			}).error(default_error_handler);
			
		},
		delete : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {method : "DELETE", path : "/flavors/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success();
			}).error(default_error_handler);
		}
	}
	
	var images_api = {
		
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/images/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.images);
			}).error(default_error_handler);
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
			
			var options = angular.extend({}, default_compute_options, {path : "/servers/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.servers);
			}).error(default_error_handler);
			
		},
		create : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback(data.server);
			}).error(default_error_handler);
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/servers/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.server);
			}).error(default_error_handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
		},
		action : function(region, id, action, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + id + "/action",
				data : action
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(default_error_handler);
		},
		attach : function(region, id, action, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + id + "/os-volume_attachments",
				data : action
			}).success(function(data, status, headers, config) {
				callback();
			}).error(default_error_handler);
		},
		detach : function(region, id, volume_id, callback) {

			var endpoint = OpenStack.endpoint("compute", region, "publicURL");

			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id + "/os-volume_attachments/" + volume_id
			}).success(function(data, status, headers, config) {
				callback();
			}).error(default_error_handler);
		}
	}
	
	var floating_ips_api = {
		listPools : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-floating-ip-pools"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.floating_ip_pools);
			}).error(default_error_handler);
		},
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-floating-ips"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.floating_ips);
			}).error(default_error_handler);
		},
		allocate : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-floating-ips",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(default_error_handler);
		},
		deallocate : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-floating-ips/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
		}
	}
	
	var volumes_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-volumes/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.volumes);
			}).error(default_error_handler);
			
		},
		create : function(region, volume, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-volumes",
				data : {volume : volume}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(default_error_handler);
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
			}).error(default_error_handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-volumes/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
		}
	}
	
	var snapshots_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-snapshots/detail"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.snapshots);
			}).error(default_error_handler);
			
		},
		create : function(region, snapshot, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-snapshots",
				data : {snapshot : snapshot}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(default_error_handler);
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
			}).error(default_error_handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-snapshots/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
		}
	};
	
	var keypairs_api = {
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-keypairs"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success($.map(data.keypairs, function(el,idx) {
					return el.keypair;
				}));
			}).error(default_error_handler);
		},
		create : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-keypairs",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(default_error_handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-keypairs/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
		}
	};
	
	var security_groups_api = {
		
		list : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-security-groups"}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.security_groups)
			}).error(default_error_handler);
		},
		create : function(region, security_group, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-groups",
				data : {security_group : security_group}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(default_error_handler);
		},
		show : function(opts) {
			
			var options = angular.extend({}, default_compute_options, {path : "/os-security-groups/" + opts.id}, opts);
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				opts.success(data.security_group);
			}).error(default_error_handler);
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-groups/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
		},
		addRule : function(region, id, rule, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-group-rules",
				data : { security_group_rule : rule }
			}).success(function(data, status, headers, config) {
				callback(data.security_group_rule);
			}).error(default_error_handler);
		},
		removeRule : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-group-rules/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(default_error_handler);
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
