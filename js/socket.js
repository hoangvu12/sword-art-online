const socket = io("");

socket.on("connect", () => {
  const init = () => {
    socket.emit("request--thread-list");
    socket.emit("request--message");
  };

  const refresh = (threadID) => {
    socket.emit("request--thread-list");
    updateMessages(threadID);
  };

  init();

  socket.on("receive--message", (msg) => {
    refresh(msg.threadID);
  });

  socket.on("receive--thread-list", (list) => {
    showThreadList(list.data);
  });

  socket.on("receive--thread-history", (history) => {
    showThreadHeader(history.id);
    showThreadMessages(history);
  });
});

socket.on("disconnect", () => {
  socket.removeAllListeners();
});
