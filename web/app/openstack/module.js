var openstack = angular.module("openstack",[]);
openstack.constant("proxy", "http://localhost:7070")
openstack.factory("OpenStack", function($http, proxy, $cacheFactory) {
	
	return {
		proxy : proxy,
		cache : $cacheFactory('openstack'),
		ajax : function(opts) {
			
			if(angular.isDefined(opts.refresh) && opts.refresh) {
				this.cache.remove(opts.url);
			}
			
			opts.cache = this.cache;
			
			opts.headers = opts.headers || {};
			
			if(proxy) {
				opts.headers['X-URI'] = opts.url;
				opts.url = proxy;
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
				var service = access.serviceCatalog.filter(function(service) {
					return service.type == serviceType;
				})[0];
				if(regionName) {
					var endpoint = service.endpoints.filter(function(endpoint) {
						return endpoint.region == regionName;
					})[0];
					return endpoint[interface];
				} else {
					return service.endpoints[0][interface];
				}
			} else {
				return null;
			}
		},
		setAuthenticationURL : function(url) {
			localStorage.setItem("os_auth_url", url);
		},
		getAuthenticationURL : function() {
			return localStorage.getItem("os_auth_url");
		},
		setAccess : function(access) {
			localStorage.setItem("access", angular.toJson(access));
		},
		getAccess : function() {
			var access = localStorage.getItem("access");
			return access != null ? angular.fromJson(access) : access;
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
			localStorage.removeItem("access");
			localStorage.removeItem("tenants");
			localStorage.removeItem("os_auth_url");
		},
		compute : {},
		storage : {}
	}

});
openstack.factory("Flavors", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var options = {
				method : "GET",
				url : OpenStack.endpoint("compute", region, "publicURL") + "/flavors/detail"
			}
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.flavors = data.flavors;
				} else { //isCallback
					modelOrCallback(data.flavors)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		show : function(region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/flavors/" + id
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.flavor = data.flavor;
				} else { //isCallback
					modelOrCallback(data.flavor)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/flavors/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});
openstack.factory("Images", function(OpenStack) {
	
	return {
		list : function(service, region, modelOrCallback, refresh) {
			
			var options = {
				method : "GET",
				url : OpenStack.endpoint("compute", region, "publicURL") + "/images/detail",
				refresh : refresh
			}
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.images = data.images;
				} else { //isCallback
					modelOrCallback(data.images)
				}
			}).error(function(data, status, headers, config) {
				alert('list images error');
			});
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
	
});
openstack.factory("Servers", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var options = {
				method : "GET",
				url : OpenStack.endpoint("compute", region, "publicURL") + "/servers/detail"
			}
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.servers = data.servers;
				} else { //isCallback
					modelOrCallback(data.servers)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		create : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback(data.server);
			}).error(function(data, status, headers, config) {

			});
		},
		show : function(region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/servers/" + id
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.servers = data.server;
				} else { //isCallback
					modelOrCallback(data.server)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		},
		action : function(region, id, action, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + id + "/action",
				data : action
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
		},
		attach : function(region, id, action, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/servers/" + id + "/os-volume_attachments",
				data : action
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
		},
		detach : function(region, id, action, callback) {

			var endpoint = OpenStack.endpoint("compute", region, "publicURL");

			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/servers/" + id + "/os-volume_attachments",
				data : action
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});
openstack.factory("FloatingIps", function(OpenStack) {
	
	return {
		listPools : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			var options = {
				method : "GET",
				url : endpoint + "/os-floating-ip-pools"
			}
			
			OpenStack.ajax(options).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.floating_ip_pools = data.floating_ip_pools;
				} else { //isCallback
					modelOrCallback(data.floating_ip_pools)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-floating-ips"
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.floating_ips = data.floating_ips;
				} else { //isCallback
					modelOrCallback(data.floating_ips)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		allocate : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-floating-ips",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
		},
		deallocate : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-floating-ips/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});
openstack.factory("Volumes", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-volumes/detail"
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.volumes = data.volumes;
				} else { //isCallback
					modelOrCallback(data.volumes)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		create : function(region, volume, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-volumes",
				data : {volume : volume}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
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
			}).error(function(data, status, headers, config) {

			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-volumes/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});
openstack.factory("Snapshots", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-snapshots/detail"
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.servers = data.servers;
				} else { //isCallback
					modelOrCallback(data.servers)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		create : function(region, snapshot, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-snapshots",
				data : {snapshot : snapshot}
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
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
			}).error(function(data, status, headers, config) {

			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-snapshots/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});
openstack.factory("KeyPairs", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-keypairs"
			}).success(function(data, status, headers, config) {
				data.keypairs = $.map(data.keypairs, function(el,idx) {
					return el.keypair;
				});
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.keypairs = data.keypairs;
				} else { //isCallback
					modelOrCallback(data.keypairs)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		create : function(region, server, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-keypairs",
				data : {server : server}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(function(data, status, headers, config) {

			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-keypairs/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});
openstack.factory("SecurityGroups", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-security-groups"
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.security_groups = data.security_groups;
				} else { //isCallback
					modelOrCallback(data.security_groups)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		create : function(region, security_group, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-groups",
				data : {security_group : security_group}
			}).success(function(data, status, headers, config) {
				callback(data);
			}).error(function(data, status, headers, config) {

			});
		},
		show : function(region, id, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/os-security-groups/" + id
			}).success(function(data, status, headers, config) {
				if(angular.isObject(modelOrCallback)) {
					modelOrCallback.security_group = data.security_group;
				} else { //isCallback
					modelOrCallback(data.security_group)
				}
			}).error(function(data, status, headers, config) {

			});
		},
		delete : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-groups/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		},
		addRule : function(region, id, rule, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "POST",
				url : endpoint + "/os-security-group-rules",
				data : { security_group_rule : rule }
			}).success(function(data, status, headers, config) {
				callback();
			}).error(function(data, status, headers, config) {

			});
		},
		removeRule : function(region, id, callback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-group-rules/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});