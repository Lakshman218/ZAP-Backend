const socketIo_Config = (io: any) => {
  let users: { userId: string; socketId: string }[] = [];

  io.on("connect", (socket: any) => {
    console.log("A client connected");
    io.emit("welcome", "this is server hi socket");
    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });

    const removeUser = (socketId: string) => {
      users = users.filter((user) => user.socketId !== socketId);
    };

    const addUser = (userId: string, socketId: string) => {
      !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
    };

    const getUser = (userId: string) => {
      console.log("id in getuser",userId);
      return users.find((user) => user.userId === userId);
    };

    //when connect
    socket.on("addUser", (userId: string) => {
      addUser(userId, socket.id);
      console.log(users);
      
      io.emit("getUsers", users);
    });

    // send and get message
    socket.on(
      "sendMessage",
      ({
        senderId,
        receiverId,
        text,
        messageType,
        file
      }: {
        senderId: string;
        receiverId: string;
        text: string;
        messageType:string;
        file:string;
      }) => {
        console.log("send msg detials",senderId,
          receiverId,
          text,
          messageType,
          file)

        const user = getUser(receiverId);
        console.log("user receiverid", user );
        console.log("checking",user?.socketId);
        io.to(user?.socketId).emit("getMessage", {
          senderId,
          text,
          messageType,
          file
        });
      }
    );


    socket.on(
      "sendNotification",
      ({
        postImage,
        receiverId,
        senderName,
        message,
      }: {
        postImage: string;
        receiverId: string;
        senderName: string;
        message:string;
      }) => {
        console.log(message);
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("getNotifications", {
          postImage,
          senderName,
          message,
        });
      }
    );

    // Listen for "typing" event from client
    socket.on(
      "typing",
      ({ senderId, recieverId }: { senderId: string; recieverId: string }) => {
        const user = getUser(recieverId);
        if (user) {
          io.to(user.socketId).emit("userTyping", { senderId });
        }
      }
    );

    // Listen for "stopTyping" event from client
    socket.on(
      "stopTyping",
      ({ senderId, recieverId }: { senderId: string; recieverId: string }) => {
        const user = getUser(recieverId);
        if (user) {
          io.to(user.socketId).emit("userStopTyping", { senderId });
        }
      }
    );

    socket.on("videoCallRequest", (data: any) => {
      const emitdata = {
        roomId: data.roomId,
        senderName:data.senderName,
        senderProfile:data.senderProfile
      };
      console.log(emitdata)
      const user = getUser(data.recieverId);
      if(user){
        io.to(user.socketId).emit("videoCallResponse", emitdata);
      }
    });

    // When disconnectec
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

export default socketIo_Config;
