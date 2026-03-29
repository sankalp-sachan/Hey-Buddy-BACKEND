import User from '../models/User.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    let connectedUserId = null;

    socket.on('setup', async (userData) => {
      if (!userData) return;
      connectedUserId = userData._id;
      socket.join(userData._id);
      
      // Update user status in DB
      await User.findByIdAndUpdate(userData._id, { status: 'online', lastSeen: new Date() });
      socket.broadcast.emit('user_online', userData._id);
      
      socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
      socket.join(room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    socket.on('new_message', (newMessageReceived) => {
      var chat = newMessageReceived.chatId;
      if (!chat.participants) return;

      chat.participants.forEach((user) => {
        if (user._id == newMessageReceived.senderId._id) return;
        socket.in(user._id).emit('message_received', newMessageReceived);
      });
    });

    socket.on('call_user', ({ userToCall, signalData, from, callerName, type }) => {
      socket.in(userToCall).emit('incoming_call', { signal: signalData, from, callerName, type });
    });

    socket.on('answer_call', (data) => {
      socket.in(data.to).emit('call_accepted', data.signal);
    });

    socket.on('reject_call', (data) => {
       socket.in(data.to).emit('call_rejected', { msg: "Call Rejected" });
    });

    socket.on('end_call', (data) => {
      socket.in(data.to).emit('call_ended');
    });

    socket.on('disconnect', async () => {
      if (connectedUserId) {
        await User.findByIdAndUpdate(connectedUserId, { status: 'offline', lastSeen: new Date() });
        socket.broadcast.emit('user_offline', connectedUserId);
      }
    });
  });
};
