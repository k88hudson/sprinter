// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('config', window.angularConfig)
  .constant('moment', window.moment)
  .factory('milestoneService', [
    '$http',
    '$rootScope',
    function($http, $rootScope) {
      var service = {};
      service.milestones = [];
      service.get = function() {
        $http
          .get('/milestone')
          .success(function(data) {
            service.milestones = data;
          });
      };

      return service;
    }
  ]);
