angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  'ui.bootstrap',
  'LocalStorageModule',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])
  .constant('config', window.angularConfig)
  .config([
    '$httpProvider',
    'config',
    function ($httpProvider, config) {
      $httpProvider.defaults.headers.common['X-CSRF-Token'] = config.csrf;
    }
  ])
  .config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {

      // html5mode
      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $routeProvider.when('/', {
        templateUrl: '/views/home.html',
        controller: 'HomeCtrl'
      });

      $routeProvider.when('/add', {
        templateUrl: '/views/add.html',
        controller: 'AddCtrl'
      });

      $routeProvider.when('/sprint/:id', {
        templateUrl: '/views/sprint.html',
        controller: 'SprintCtrl'
      });

      $routeProvider.otherwise({
        redirectTo: '/'
      });
    }
  ])
  .run([
    '$rootScope',
    '$http',
    'sprintService',
    function ($rootScope, $http, sprintService) {
      // Jump to top of viewport when new views load
      $rootScope.$on('$locationChangeSuccess', function(event) {
        window.scrollTo(0, 0);
      });

      $http
        .get('/user')
        .success(function (user) {
          $rootScope.user = user;
        })
        .error(function() {
          $rootScope.user = null;
        });

    }
  ]);
