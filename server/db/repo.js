module.exports = function(sequelize, t) {

  // Repository
  // id
  // owner
  // repo
  // ghSprintID
  // ghSprintName
  // createdAt
  // updatedAt

  return sequelize.define('Sprint', {
    whiteboard: t.STRING,
    title: {
      type: t.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },
    description: t.TEXT,
    defaultComponent: t.STRING,
    dueDate: t.DATE
  });
};
