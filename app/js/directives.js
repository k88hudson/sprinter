// Directives -----------------------------------------------------------------

angular.module('myApp.directives', [])
  .directive('appVersion', ['version',
    function (version) {
      return function (scope, elm, attrs) {
        elm.text(version);
      };
    }
  ])
  .directive('ngClick', function () {
    // Prevent default on all elements that have ngClick defined
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        if (attrs.href === '#') {
          el.on('click', function (e) {
            e.preventDefault();
          });
        }
      }
    };
  })
  .directive('row', function () {
    return {
      restrict: 'E',
      link: function (scope, el, attrs) {
        el.addClass('row');
      }
    };
  })
  .directive('i', function () {
    // Prevent default on all elements that have ngClick defined
    return {
      restrict: 'E',
      link: function (scope, el, attrs) {
        el.addClass('fa fa-' + attrs.fa);
      }
    };
  });
