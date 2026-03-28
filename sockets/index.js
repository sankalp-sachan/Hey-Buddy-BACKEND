export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
      socket.join(userData._id);
      socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    socket.on('new_message', (newMessageReceived) => {
      var chat = newMessageReceived.chatId;

      if (!chat.participants) return console.log('chat.participants not defined');

      chat.participants.forEach((user) => {
        if (user._id == newMessageReceived.senderId._id) return;

        socket.in(user._id).emit('message_received', newMessageReceived);
      });
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED');
      // socket.leave(userData._id); // This is not needed as it happens automatically on disconnect
    });
  });
};
