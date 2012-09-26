angular.module('ss.ui',[])
	.factory("bus", function() {
		var topics = {};
		var bus = {
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
			}
		}
		return bus;
	})
	.factory('modal', function($http, $compile) {
		
		var modal = $('#modal');
		modal.addClass("modal fade hide");
		
		return {
			show : function(src, scope) {
				$http.get(src).success(function(response) {
					modal.html(response);
					$compile(modal.contents())(scope)
					modal.modal();
				});
				scope.hide = function() {
					modal.modal('hide');
					modal.html('');
				};
			}
		}
	})
	.filter('logo', function() {
		return function(name) {
			if(name) {
				name = name.toLowerCase();
				if(name.indexOf("debian") == 0) {
					return '/images/icons/debian.png';
				} else if (name.indexOf("ubuntu") == 0){
					return '/images/icons/ubuntu.png';
				} else if (name.indexOf("fedora") == 0){
					return '/images/icons/fedora.png';
				} else if (name.indexOf("windows") == 0){
					return '/images/icons/windows.png';
				} else {
					return '/images/icons/linux.png';
				}
			}
		}
	})
	.filter('_rest', function() {
		return function(array) {
			if(array) {
				return _.rest(array);
			} else {
				return []
			}

		}
	})
	.directive('fileUpload', function() {

		return function(scope, element, attrs) {
			element.bind("change", function(e) {
				var files = e.target.files || e.dataTransfer.files;
				scope.$apply(function() {
					scope.file = files[0];
				});
			});
		}
	})
	.directive('menu', function($route, $location, $compile) {

		return function(scope, element, attrs) {

			element.find('li').removeClass('active').filter(function() {
				return $(this).data("menu") == $route.current.menu;
			}).addClass('active');

		}

	})
	.directive("wizard", function($http, $compile) {
		return {
			restrict : 'C',
			link : function(scope, element, attrs) {
				
				var $modal_body = $('.modal-body');
				var $footer = $('.modal-footer')
				var $previous = $footer.find('.btn-previous')
				var $next = $footer.find('.btn-next')
				var $finish = $footer.find('.btn-finish')

				

				_.each(scope.steps, function(step) {

					var ws = $('<div class="wizard-step"></div>').appendTo($modal_body);
					
					$http.get(step.src).success(function(response) {
						ws.html(response)
						$compile(ws.contents())(scope)
					});
				});

				var $steps = $('.wizard-step')

				var ui = function() {
					//$previous.prop("disabled", scope.step == 0)
					$previous.hide();
					$next.hide();
					$finish.hide();
					if(scope.step != 0) {
						$previous.show();
						if(scope.step == $steps.length - 1) {
							$next.hide();
							$finish.show();
						} else {
							$next.show();
							$finish.hide();
						}
					}
				}

				scope.show = function(step) {
					if(step >= 0 && step < $steps.length) {
						scope.step = step;
						$steps.hide().filter(":eq("+step+")").show();
						ui();
					}
				}

				scope.on_previous = function() {
					scope.show(scope.step - 1)
				}

				scope.on_next = function() {
					scope.show(scope.step + 1)
				}

				scope.totalSteps = $steps.length;

				scope.show(0);

			}
		}
	})
	.directive('withSelectionCheckboxes', function() {
		return function(scope, element, attrs) {

			scope.checkAll = function() {
				var items = scope[attrs.withSelectionCheckboxes];
				angular.forEach(items, function(item) {
					item.checked = scope.checkedAll;
				});
			}

			scope.allChecked = function() {
				var items = scope[attrs.withSelectionCheckboxes];
				if(items && items.length) {
					var isCheckedAll = true;
					angular.forEach(items, function(item) {
					    if (item && !item.checked) {
							isCheckedAll = false;
							return;
						}
					});
					return isCheckedAll;
				} else {
					return false;
				}
			};
		}
	})
	.run(function() {
		
	});