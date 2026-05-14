const cron = require('node-cron');
const { sequelize, Message, ArchivedMessage } = require('../models');

// Run daily at midnight: '0 0 * * *'
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily archive job...');
  const transaction = await sequelize.transaction();

  try {
    // 1. Find all messages
    const messagesToArchive = await Message.findAll({ transaction });

    if (messagesToArchive.length > 0) {
      // 2. Insert into ArchivedMessage
      const recordsToInsert = messagesToArchive.map(m => m.get({ plain: true }));
      await ArchivedMessage.bulkCreate(recordsToInsert, { transaction });

      // 3. Delete from Message
      const messageIds = recordsToInsert.map(m => m.id);
      await Message.destroy({
        where: { id: messageIds },
        transaction
      });

      console.log(`Successfully archived ${messagesToArchive.length} messages.`);
    } else {
      console.log('No messages to archive.');
    }

    await transaction.commit();
  } catch (error) {
    console.error('Archive job failed:', error);
    await transaction.rollback();
  }
});

console.log('Archive job scheduled.');
