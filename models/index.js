const sequelize = require('../utils/dbConnection');
const User = require('./user');
const Message = require('./message');
const ArchivedMessage = require('./archivedMessage');

// Associations
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId' });

User.hasMany(ArchivedMessage, { foreignKey: 'senderId' });
ArchivedMessage.belongsTo(User, { foreignKey: 'senderId' });

module.exports = {
  sequelize,
  User,
  Message,
  ArchivedMessage,
};
