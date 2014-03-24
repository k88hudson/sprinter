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

      $routeProvider.when('/add', {
        templateUrl: 'views/add.html',
        controller: 'AddCtrl'
      });

      $routeProvider.when('/milestone/:id', {
        templateUrl: 'views/milestone.html',
        controller: 'MilestoneCtrl'
      });

      $routeProvider.otherwise({
        redirectTo: '/'
      });
    }
  ])
  .run([
    '$rootScope',
    'milestoneService',
    function ($rootScope, milestoneService) {
      // Jump to top of viewport when new views load
      $rootScope.$on('$locationChangeSuccess', function(event) {
        window.scrollTo(0, 0);
      });

      milestoneService.refresh();

      // $rootScope.milestones = [
      //   {
      //     id: 0,
      //     title: 'Events MVP',
      //     dueDate: 'March 7 2014',
      //     whiteboard: 'events2, mvp'
      //   },
      //   {
      //     id: 1,
      //     title: 'Events Fast-follow',
      //     dueDate: 'March 14 2014',
      //     whiteboard: 'events2, r2'
      //   },
      //   {
      //     id: 0,
      //     title: 'Explore MVP',
      //     dueDate: 'March 20, 2014',
      //     whiteboard: 'explore, mvp'
      //   },
      //   {
      //     id: 1,
      //     title: 'Explore R2',
      //     dueDate: 'March 28, 2014',
      //     whiteboard: 'explore, r2'
      //   },
      //   {
      //     id: 2,
      //     title: 'Events R3',
      //     dueDate: 'March 20, 2014',
      //     whiteboard: 'events2, r3'
      //   }
      //   {
      //     id: 4,
      //     title: 'Webmaker.org March 14',
      //     dueDate: 'March 14 2014',
      //     whiteboard: 'webmaker.org, 2014-03-14'
      //   },
      //   {
      //     id: 5,
      //     title: 'Login Phase 4',
      //     dueDate: 'March 7 2014',
      //     whiteboard: 'login2-phase4'
      //   }
      // ];

    }
  ]);
