'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
   static associate(models) {
      // define association here
      Chapters.belongsTo(models.User, {
        foreignKey: "eid",
      });
   
   
      // define association here
      Chapters.belongsTo(models.Course, {
        foreignKey: "crsid",
      });
   
   }
}
  Chapters.init({
    chid:DataTypes.INTEGER,
    chname: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Chapters',
  });
  return Chapters;
};