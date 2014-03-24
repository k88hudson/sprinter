// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('config', window.angularConfig)
  .constant('moment', window.moment)
  .factory('milestoneService', [
    '$http',
    '$rootScope',
    function($http, $rootScope) {
      return {
        refresh: function() {
          $http
            .get('/milestone')
            .success(function (data) {
              $rootScope.milestones = data;
            });
        }
      };
    }
  ]);
