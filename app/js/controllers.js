// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('sidebarCtrl', [
    '$scope',
    '$http',
    '$rootScope',
    'sprintService',
    'config',
    function ($scope, $http, $rootScope, sprintService, config) {

      $scope.canEdit = function canEdit(user) {
        if (!user) {
          return false;
        }
        return config.admins.indexOf(user.login.toLowerCase()) > -1;
      };

      $scope.$on('sprintRefresh', function (event, sprints) {
        $scope.sprints = sprints;
      });
      sprintService.get();

      $scope.login = function login() {
        window.location = '/auth';
      };

      $scope.logout = function logout() {
        $http
          .get('/auth/logout')
          .success(function () {
            $rootScope.user = null;
          });
      };
    }
  ])
  .controller('HomeCtrl', ['$scope', '$http', 'localStorageService',
    function ($scope, $http, localStorageService) {
      $scope.flagList = function (flags) {
        return flags.map(function (flag) {
          return flag.setter;
        }).join(', ');
      };

      $scope.bugzillaEmail = localStorageService.get('bugzilla_email');

      $scope.$watch('bugzillaEmail', function() {
        localStorageService.set('bugzilla_email', $scope.bugzillaEmail);
      });

      $scope.onEmailChange = function (email) {
         $http({
            method: 'GET',
            url: '/flags',
            params: {
              user: email
            }
          })
          .success(function (data) {
            console.log(data);
            $scope.flags = data;
          });
      };

      // Init
      $scope.onEmailChange($scope.bugzillaEmail);
    }
  ])
  .controller('AddCtrl', ['$scope', '$http', 'moment', 'sprintService',
    function($scope, $http, moment, sprintService) {

      // The default dueDate should be today

      function reset() {
        $scope.new = {
          dueDate: moment().day('Friday').toDate()
        };
      }

      reset();

      $scope.getRepoInfo = function() {
        $http
          .get('/github/milestones', {
            params: {
              repo: $scope.new.repo
            }
          })
          .success(function (data) {
            if (data.length) {
              $scope.repoMilestones = data;
            } else {
              $scope.repoMilestones = [];
            }
            console.log($scope);
          });
      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.dateOptions = {
         'year-format': "'yy'",
         'show-weeks': false
       };

       $scope.submit = function() {

        // Set the time of the due date to 4:00PM Eastern, which is when our demos are
        $scope.new.dueDate = moment($scope.new.dueDate).hour(16).startOf('hour').toDate();

        $http
          .post('/api/sprint', $scope.new)
          .success(function(data) {
            reset();
            sprintService.get();
          })
          .error(function(err) {
            console.log(err);
          });
       };

       $scope.activeTab = 'bugzilla';

    }
  ])
  .controller('SprintCtrl', ['$scope', '$http', '$rootScope', '$routeParams',

    function($scope, $http, $rootScope, $routeParams) {

      $scope.m = {};

      $scope.archive = function() {
        $http
          .put('/api/sprint/' + $routeParams.id, {
            archived: true
          })
          .success(function(data) {
            $scope.m = data;
          });
      };

      $http
        .get('/api/sprint/' + $routeParams.id)
        .success(function(data) {
          $scope.m = data;
          $rootScope.title = data.title;
        });

      $scope.newBugUrl = function() {
        var link = 'https://bugzilla.mozilla.org/enter_bug.cgi?product=Webmaker' +
        '&status_whiteboard=' + encodeURIComponent($scope.m.whiteboard);

        if ($scope.m.defaultComponent) {
          link += ('&component=' + encodeURIComponent($scope.m.defaultComponent));
        }
        return link;
      };

      $scope.bugs = [];
      $scope.complete = {};

      $scope.userStories = [
        {
          userType: "vistor",
          action: "understand what I can do on /events on first landing",
          bugs: '42432, 23131'
        },
        {
          userType: "vistor",
          action: "understand what I can do on /events on first landing"
        },
        {
          userType: "vistor",
          action: "understand what I can do on /events on first landing"
        }
      ];

      $scope.fields = [
        {
          name: 'Updated',
          bz: 'last_change_time'
        },
        {
          name: 'ID',
          bz: 'id'
        },
        {
          name: 'Bug',
          bz: 'summary'
        },
        {
          name: 'Whiteboard',
          bz: 'whiteboard',
          class: 'visible-lg'
        },
        {
          name: 'Assigned',
          bz: 'assigned_to_detail.real_name'
        },
        {
          name: 'Status',
          bz: 'status'
        }
      ];

      var asc = '';
      var desc = '-';

      function switchDir(dir) {
        return dir === '-' ? '' : '-';
      }

      $scope.orderField = 'last_change_time';
      $scope.orderDir = desc;

      $scope.setOrderBy = function(field) {
        if (field === $scope.orderField) {
          $scope.orderDir = switchDir($scope.orderDir);
        } else {
          $scope.orderField = field;
          if (field === 'last_change_time' || field === 'status') {
            $scope.orderDir = desc;
          } else {
            $scope.orderDir = asc;
          }
        }
      };

      function isResolved(bug) {
        return bug.status === 'RESOLVED';
      }

      $scope.$watch('bugs', function() {
        var bugsResolved = Math.floor($scope.bugs.filter(isResolved).length);
        var totalBugs =  $scope.bugs.length;
        $scope.complete = {
          percentage:  Math.round(bugsResolved / totalBugs * 100),
          resolved: bugsResolved,
          total: totalBugs
        };
      });

      $scope.getBugs = function() {
        $scope.bugs = [];
        $http({
            method: 'GET',
            url: '/bug',
            params: {
              product: 'Webmaker',
              whiteboard: $scope.m.whiteboard,
              limit: 200
            }
          })
          .success(function (data) {
            $scope.bugs = data;
          });
      };

      $scope.$watch('m', function() {
        if (!$scope.m.whiteboard) {
          return;
        }
         $scope.getBugs();
       });

    }
  ]);
