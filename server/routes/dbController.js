module.exports = function(db) {

  return {

    get: {
      all: function(req, res) {
        var limit = req.query.limit || 30;
        var order = req.query.order || 'dueDate';

        db.milestone
          .findAll({
            limit: limit,
            order: order
            // where: {
            //   dueDate: {
            //     gte: new Date()
            //   }
            // }
          })
          .success(function(data) {
            res.json(data);
          })
          .error(function(err) {
            res.statusCode = 500;
            res.json(err);
          });
      },
      id: function(req, res) {

        db.milestone
          .find(req.params.id)
          .success(function(data) {
            res.json(data);
          });

      }
    },

    post: function(req, res) {

      // Authentication todo

      db.milestone
        .create(req.body)
        .success(function(data) {
          res.json(data);
        })
        .error(function(err) {
          res.send(500, err);
        });
    },

    put: function(req, res) {
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
        .error(function(err) {
          res.send(500, err);
        });
    },

    delete: function(req, res) {
      var id = req.params.id;

      db.milestone
        .find(id)
        .success(function(eventInstance) {

          // No event
          if (!eventInstance) {
            return res.send(404, 'No event found for id ' + id);
          }

          // Authentication
          if (!isAuthorized(req, eventInstance)) {
            return res.send(403, 'You are not authorized to edit this event');
          }

          eventInstance
            .destroy()
            .success(function(data) {
              res.json(data);
            })
            .error(function(err) {
              res.statusCode = 500;
              res.json(err);
            });
        })
        .error(function(err) {
          res.send(500, err);
        });
    }
  };

};
