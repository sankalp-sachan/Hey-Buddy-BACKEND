import User from '../models/User.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    let connectedUserId = null;

    socket.on('setup', async (userData) => {
      const userId = (userData && userData._id) ? userData._id : userData;
      if (!userId) return;
      
      connectedUserId = userId.toString();
      socket.join(connectedUserId);
      console.log('User setup room:', connectedUserId);
      
      // Update user status in DB
      await User.findByIdAndUpdate(connectedUserId, { status: 'online', lastSeen: new Date() });
      socket.broadcast.emit('user_online', connectedUserId);
      
      socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
      socket.join(room);
      console.log('User joined room:', room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    socket.on('new_message', (newMessageReceived) => {
      const chat = newMessageReceived.chatId;
      console.log('Recieved message for chat:', chat?._id || chat);
      
      if (!chat || !chat.participants) {
        console.log('Message discarded: No participants found in chatId');
        return;
      }

      chat.participants.forEach((user) => {
        const userId = user._id || user; // Handle both populated and non-populated
        const senderIdRaw = newMessageReceived.senderId._id || newMessageReceived.senderId;

        if (userId.toString() === senderIdRaw.toString()) return;
        
        console.log('Relaying message to user:', userId.toString());
        io.to(userId.toString()).emit('message_received', newMessageReceived);
      });
    });

    socket.on('call_user', ({ userToCall, signalData, from, callerName, type }) => {
      console.log('Call from', callerName, 'to', userToCall);
      io.to(userToCall).emit('incoming_call', { signal: signalData, from, callerName, type });
    });
    socket.on('answer_call', (data) => {
      console.log('Call answered for to:', data.to);
      io.to(data.to).emit('call_accepted', data.signal);
    });
    socket.on('reject_call', (data) => {
       io.to(data.to).emit('call_rejected', { msg: "Call Rejected" });
    });
    socket.on('end_call', (data) => {
      io.to(data.to).emit('call_ended');
    });

    socket.on('disconnect', async () => {
      if (connectedUserId) {
        await User.findByIdAndUpdate(connectedUserId, { status: 'offline', lastSeen: new Date() });
        socket.broadcast.emit('user_offline', connectedUserId);
      }
    });
  });
};
