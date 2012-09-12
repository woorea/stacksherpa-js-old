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
			
		},
		compute : {},
		storage : {}
	}

});