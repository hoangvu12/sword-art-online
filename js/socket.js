const socket = io("");

socket.on("connect", () => {
  const init = () => {
    socket.emit("request--current-userid");
    socket.emit("request--thread-list");
    socket.emit("request--message");
  };

  init();

  socket.on("receive--current-userid", (id) => {
    myID = id;
  });

  socket.on("receive--message", (msg) => {
    handleNewMessage(msg);
  });

  socket.on("receive--thread-list", (list) => {
    showThreadList(list.data);
  });

  socket.on("receive--thread-history", (history) => {
    showThreadHeader(history.id);
    showThreadMessages(history);
  });
});
