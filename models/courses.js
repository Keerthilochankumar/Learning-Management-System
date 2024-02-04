'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     Courses.belongsTo(models.User, {
        foreignKey: "userId",
      });

      Courses.hasMany(models.Chapters, {
        foreignKey: "courseId",
      });
    }
  }
  Courses.init({
    coursetitle: DataTypes.STRING,
    coursecontent: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Courses',
  });
  return Courses;
};