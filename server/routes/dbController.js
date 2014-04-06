module.exports = function(db) {

  return {

    get: {
      all: function(req, res, next) {
        var limit = req.query.limit || 30;
        var order = req.query.order || 'dueDate';

        db.milestone
          .findAll({
            limit: limit,
            order: order
          })
          .success(function(data) {
            res.json(data);
          })
          .error(next);
      },
      id: function(req, res, next) {

        db.milestone
          .find(req.params.id)
          .success(function(data) {
            res.json(data);
          })
          .error(next);

      }
    },

    post: function(req, res, next) {

      // Authentication todo

      db.milestone
        .create(req.body)
        .success(function(data) {
          res.json(data);
        })
        .error(next);
    },

    put: function(req, res, next) {
      var id = req.params.id;
      var updatedAttributes = req.body;

      // First, find the milestone
      db.milestone
        .find(id)
        .success(function(milestoneInstance) {

          // Not found
          if (!milestoneInstance) {
            return res.send(404, 'No milestone found for id ' + id);
          }

          milestoneInstance
            .updateAttributes(updatedAttributes)
            .success(function(data) {
              res.json(data);
            })
            .error(function(err) {
              res.send(500, err);
            });

        })
        .error(next);
    },

    delete: function(req, res, next) {
      var id = req.params.id;

      db.milestone
        .find(id)
        .success(function(milestoneInstance) {

          // No event
          if (!milestoneInstance) {
            return res.send(404, 'No event found for id ' + id);
          }

          // Authentication
          if (!isAuthorized(req, milestoneInstance)) {
            return res.send(403, 'You are not authorized to edit this milestone');
          }

          milestoneInstance
            .destroy()
            .success(function(data) {
              res.json(data);
            })
            .error(function(err) {
              res.statusCode = 500;
              res.json(err);
            });
        })
        .error(next);
    }
  };

};
