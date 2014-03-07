// Filters --------------------------------------------------------------------

angular.module('myApp.filters', [])
  .filter('nameFilter', function () {
    return function (name) {
      return name.split(' ')[0].replace(';', '');
    };
  })
  .filter('timeago', ['moment', function (moment) {
    return function (date) {
      return moment(date).fromNow();
    }
  }]);
