var openstack = angular.module("openstack",[]);
openstack.constant("proxy", "http://192.168.1.36:8080/api")
openstack.factory("OpenStack", function($http, proxy) {
	
	return {
		proxy : proxy,
		/*
		OpenStack.ajax({
			type : "POST",
			url : provider.authURL,
			data : {auth : provider.auth},
			success : function(data) {
				OpenStack.access = data.access;
				$scope.$location.path("openstack")
				$rootScope.$apply();
			}
		})
		*/
		/*
		ajax : function(opts) {
			
			opts.crossDomain = true;
			
			opts.headers = opts.headers || {};
			
			if(proxy) {
				opts.headers['X-URI'] = opts.url;
				opts.url = proxy;
			}
			
			if(this.access) {
				opts.headers['X-Auth-Token'] = this.access.token.id;
			}
			
			if(opts.data && !opts.contentType) {
				opts.contentType = "application/json; charset=UTF-8";
				opts.data = JSON.stringify(opts.data)
			}
			
			if(!opts.dataType) {
				opts.dataType = "json";
			}
			
			$.ajax(opts);
		}
		*/
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
				return endpoint[interface].replace(".38",".37");
			} else {
				return service.endpoints[0][interface].replace(".38",".37");
			}
			
		}
	}

});