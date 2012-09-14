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
		show : function(region, id, modelOrCallback) {
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
		}
	}
	
});