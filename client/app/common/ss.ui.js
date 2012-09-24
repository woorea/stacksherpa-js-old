angular.module('ss.ui',[])
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

		return function(scope, element, attrs) {
			
			var $modal_body = $('.modal-body')
			var $footer = $('.modal-footer')
			var $previous = $footer.find('.btn-previous')
			var $next = $footer.find('.btn-next')
			var $finish = $footer.find('.btn-finish')
			
			_.each(scope.steps, function(step) {
				var ws = $('<div class="wizard-step"></div>').appendTo($modal_body);
				$http.get(step).success(function(response) {
					ws.html($compile(response)(scope));
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

			scope.onCancel = function() {
				scope.$root.$broadcast('modal.hide');
			}

			scope.onPrevious = function() {
				scope.show(scope.step - 1)
			}

			scope.onNext = function() {
				scope.show(scope.step + 1)
			}

			scope.totalSteps = $steps.length;
			
			scope.show(0);
			
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
	.directive('bootstrapModal', function($http, $templateCache, $compile) {

		return function(scope, element, attrs) {

			$modal = $('#modal');

			var modalScope;

			element.click(function() {

				if (modalScope) modalScope.$destroy();
				modalScope = scope.$new();

				var partial = attrs.bootstrapModal;

				//TODO: use $templateCache
				//$http.get(partial, {cache: $templateCache}).success(function(response) {
				$http.get(partial).success(function(response) {
					$modal.html(response);
					$compile($modal.contents())(modalScope);
				});
				//scope.$root.$broadcast('modal.show',{view : partial});
			});
			scope.onCloseModal = function() {
				$modal.html('');
			}
			scope.$on('modal.hide', function(event, args) {
				$modal.html('');
			})
		}
	});