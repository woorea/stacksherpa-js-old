var openstack = angular.module("openstack",[]);
openstack.constant("proxy", "http://192.168.1.36:8080/api")
openstack.factory("OpenStack", function($http, proxy) {
	
	return {
		proxy : proxy,
		ajax : function(opts) {
			
			opts.headers = opts.headers || {};
			
			if(proxy) {
				opts.headers['X-URI'] = opts.url;
				opts.url = proxy;
			}
			
			if(this.access) {
				opts.headers['X-Auth-Token'] = this.access.token.id;
			}
			
			return $http(opts)
		},
		endpoint : function(serviceType, regionName, interface) {
			if(angular.isArray(this.access.serviceCatalog)) {
				var service = this.access.serviceCatalog.filter(function(service) {
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
		compute : {},
		storage : {}
	}

});
openstack.factory("Flavors", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/flavors/detail"
			}).success(function(data, status, headers, config) {
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
		}
	}
	
});
openstack.factory("Images", function(OpenStack) {
	
	return {
		list : function(service, region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint(service, region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/images/detail"
			}).success(function(data, status, headers, config) {
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
		}
	}
	
});
openstack.factory("Servers", function(OpenStack) {
	
	return {
		list : function(region, modelOrCallback) {
			
			var endpoint = OpenStack.endpoint("compute", region, "publicURL");
			
			OpenStack.ajax({
				method : "GET",
				url : endpoint + "/servers/detail"
			}).success(function(data, status, headers, config) {
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
				callback();
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
				url : endpoint + "/servers/" + $routeParams.id + "/action",
				data : action
			}).success(function(data, status, headers, config) {
				callback();
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
		delete : function(region, id, callback) {
			OpenStack.ajax({
				method : "DELETE",
				url : endpoint + "/os-security-groups/" + id
			}).success(function(data, status, headers, config) {
				callback()
			}).error(function(data, status, headers, config) {

			});
		}
	}
	
});