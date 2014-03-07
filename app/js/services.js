// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('config', window.angularConfig)
  .constant('moment', window.moment);
  // .factory('bzService', function('$http', '$resource', 'config') {
  //   var baseUrl = config.bz_url + '/bug';
  //   var defaults = {
  //     product: 'Webmaker'
  //   };

  //   return $resource(baseUrl, defaults);
  // });
