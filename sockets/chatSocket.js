const socketAuth = require('../middleware/socketAuth');
const { Message, User } = require('../models');

module.exports = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (Socket ID: ${socket.id})`);

    socket.on('join_room', async ({ roomName, targetEmail }) => {
      let roomId;
      let finalRoomName = roomName;

      if (targetEmail) {
        // Direct Chat (Auto Room)
        const emails = [socket.user.email, targetEmail].sort();
        roomId = emails.join(',');
        finalRoomName = null; // No custom name for direct chats
      } else if (roomName) {
        // Custom Room
        // Simple hash/slug for room ID based on name
        roomId = roomName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      } else {
        return socket.emit('error', 'Must provide roomName or targetEmail');
      }

      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      socket.to(roomId).emit('receive_message', {
        system: true,
        message: `${socket.user.name} joined.`
      });

      // Fetch previous messages
      try {
        const messages = await Message.findAll({
          where: { roomId },
          order: [['createdAt', 'ASC']],
          include: [{ model: User, attributes: ['name', 'email'] }]
        });
        
        const mappedMessages = messages.map(msg => ({
          id: msg.id,
          roomId: msg.roomId,
          roomName: msg.roomName,
          senderId: msg.senderId,
          senderEmail: msg.User ? msg.User.email : null,
          senderName: msg.User ? msg.User.name : null,
          message: msg.message,
          fileUrl: msg.fileUrl,
          createdAt: msg.createdAt
        }));
        socket.emit('previous_messages', mappedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    });

    socket.on('send_message', async (data) => {
      const { roomId, roomName, message, fileUrl } = data;

      if (!roomId || (!message && !fileUrl)) return;

      try {
        const savedMessage = await Message.create({
          roomId,
          roomName,
          senderId: socket.user.id,
          message: message || '',
          fileUrl: fileUrl || null,
        });

        io.to(roomId).emit('receive_message', {
          id: savedMessage.id,
          roomId,
          roomName,
          senderId: socket.user.id,
          senderEmail: socket.user.email,
          senderName: socket.user.name,
          message: savedMessage.message,
          fileUrl: savedMessage.fileUrl,
          createdAt: savedMessage.createdAt,
        });
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('typing', { senderEmail: socket.user.email });
    });

    socket.on('disconnecting', () => {
      if (socket.user && socket.user.name) {
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.to(room).emit('receive_message', {
              system: true,
              message: `${socket.user.name} has left the chat.`
            });
          }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });
};
