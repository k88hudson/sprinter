angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  'ui.bootstrap',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])
  .config(['$routeProvider',
    function($routeProvider) {

      $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      });

      $routeProvider.when('/milestone/:id', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      });

      $routeProvider.otherwise({
        redirectTo: '/'
      });
    }
  ])
  .run(['$http', '$rootScope',
    function($http, $rootScope) {
      // Jump to top of viewport when new views load
      $rootScope.$on('$locationChangeSuccess', function(event) {
        window.scrollTo(0, 0);
      });

      $rootScope.milestones = [
        {
          id: 0,
          title: 'Events MVP',
          dueDate: 'March 7 2014',
          whiteboard: 'events2, mvp'
        },
        {
          id: 1,
          title: 'Events Fast-follow',
          dueDate: 'March 14 2014',
          whiteboard: 'events2, r2'
        },
        {
          id: 2,
          title: 'Explore MVP',
          dueDate: 'March 14 2014',
          whiteboard: 'explore, mvp'
        },
        {
          id: 3,
          title: 'Login Phase 4',
          dueDate: 'March 7 2014',
          whiteboard: 'login2-phase4'
        }
      ];

    }
  ]);
