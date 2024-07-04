require('dotenv').config();
const bucketName = process.env.BUCKET_NAME as string;
const region = process.env.BUCKET_REGION as string;

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
      console.log("users in getuser",users);
      return users.find((user) => user.userId === userId);
    };

    //when connect
    socket.on("addUser", (userId: string) => {
      addUser(userId, socket.id);
      console.log("in adduser",users);
      
      io.emit("getUsers", users);
    });

    // send and get message
    socket.on("sendMessage", ({
      senderId,
      receiverId,
      text,
      messageType,
      file,
      sharedPost, 
    }: {
      senderId: string;
      receiverId: string;
      text: string;
      messageType: string;
      file: string;
      sharedPost: any; 
    }) => {
      console.log("Sending message:", { senderId, receiverId, text, messageType, file, sharedPost, });
  
      const receiver = getUser(receiverId);
      console.log("receiverId",receiver);
      if (receiver && receiver.socketId) {
        io.to(receiver.socketId).emit("getMessage", {
          senderId,
          text,
          messageType,
          file:`https://${bucketName}.s3.${region}.amazonaws.com/${file}`,
          sharedPost, 
        });
      } else {
        console.log(`Receiver with userId ${receiverId} not found or offline`);
      }
    });


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
      console.log("videoCallResponse",emitdata)
      console.log("receiverid", data);
      const user = getUser(data.receiverId);
      console.log("receiverid", user);
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
