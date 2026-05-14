const { DataTypes } = require('sequelize');
const sequelize = require('../utils/dbConnection');

const ArchivedMessage = sequelize.define('ArchivedMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Keep original ID if possible, or auto-increment
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ArchivedMessage;
