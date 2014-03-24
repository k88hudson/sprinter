module.exports = function(sequelize, t) {

  // Milestone
  // id
  // whiteboard
  // title
  // description
  // teamID
  // defaultComponent
  // dueDate
  // createdAt
  // updatedAt

  return sequelize.define('Milestone', {
    whiteboard: t.STRING,
    title: t.STRING,
    description: t.TEXT,
    defaultComponent: t.STRING,
    dueDate: t.DATE
  });
};
