let myID = "100029483922771";
let threadList;

function showThreadList(list) {
  const $container = $(".messenger-conversations");

  $container.empty();

  threadList = list;

  // Loop through each thread
  list.forEach((thread) => {
    // Create a div thread container.
    const divContainer = document.createElement("div");
    divContainer.className = "conversation";

    // Create info container
    const { info, element: divInfo } = createInfo(thread);

    // Create thumbnail container.
    const { thumbnail, element: divThumbnail } = createThumbnail(thread);

    // If unread counter > 0 then add unread.
    if (thread.unreadCount > 0) {
      $(divContainer).addClass("conversation-unread");
    }

    // Add data to container.
    $(divContainer).data({
      name: info.name,
      thumbnail,
      id: thread.threadID,
    });

    $(divContainer).append([divThumbnail, divInfo]);

    $(divContainer).click(() => {
      requestMessages(thread.threadID); // First request messages from server.
      removeActiveThreads(); // Remove active threads.
      addActiveThread(thread.threadID); // Add clicked thread to active state.
    });

    $container.append(divContainer);
  });

  function createInfo(info) {
    const divInfo = document.createElement("div");
    divInfo.className = "info";

    const divName = document.createElement("div");
    divName.className = "name";
    divName.innerText = info.name;

    const recentMessage = document.createElement("div");

    let recentMsg;
    let name;

    // Decide to show what recent message should show.
    if (!info.snippet.includes("You sent") && info.isGroup) {
      // Find info from who sent the last message.
      let snippetSender = info.participants.find(
        (user) => user.userID === info.snippetSender
      );

      // If it was me, show "You" instead of my name.
      if (info.snippetSender === myID) {
        name = "You";
      } else {
        name = snippetSender.shortName;
      }

      recentMsg = `${name}: ${info.snippet}`;
    } else {
      recentMsg = info.snippet;
    }

    // if there is unread messages, add unread icon (a little dot).
    if (info.unreadCount > 0) {
      const divIcon = document.createElement("div");
      divIcon.className = "unread-icon";

      $(divInfo).append(divIcon);
    }

    // Recent message.
    recentMessage.className = "recent-message";
    recentMessage.innerText = recentMsg;

    $(divInfo).append([divName, recentMessage]);

    let returnData = { name: info.name, recentMsg };

    return { info: returnData, element: divInfo };
  }

  function createThumbnail(info) {
    // If the thread is a group, take group's image otherwise take first member's profile picture.
    let thumbnail = info.imageSrc || info.participants[0].profilePicture;

    const divThumbnail = document.createElement("div");
    divThumbnail.className = "thumb";

    const image = document.createElement("img");

    image.src = thumbnail;

    $(divThumbnail).append(image);

    return { thumbnail, element: divThumbnail };
  }

  function removeActiveThreads() {
    $(".messenger .conversation.conversation-active").each((i, e) =>
      $(e).removeClass("conversation-active")
    );
  }

  function addActiveThread(threadID) {
    const conversationEl = $("*").filterByData("id", threadID);

    if (conversationEl.hasClass("conversation-unread")) {
      conversationEl.removeClass("conversation-unread");
      conversationEl.find(".unread-icon").remove();
    }

    conversationEl.addClass("conversation-active");
  }
}

function showThreadHeader(threadID) {
  const $container = $(".conversation-header");

  $container.empty();

  // Find container by thread's ID assigned to the container.
  const conversationEl = $("*").filterByData("id", threadID);

  // Thumbnail container
  const { element: divThumbnail } = createThumbnail(
    conversationEl.data("thumbnail")
  );

  // Name container
  const { element: divName } = createName(conversationEl.data("name"));

  $container.append([divThumbnail, divName]);

  function createName(name) {
    const divName = document.createElement("div");
    divName.className = "name";

    divName.innerText = name;

    return { name, element: divName };
  }

  function createThumbnail(thumbnail) {
    const divThumbnail = document.createElement("div");
    divThumbnail.className = "thumb";

    const image = document.createElement("img");

    image.src = thumbnail;

    $(divThumbnail).append(image);

    return { thumbnail, element: divThumbnail };
  }
}

function showThreadMessages(history) {
  const $container = $(".conversation-body");
  const container = $container.get(0);

  $container.data({
    id: history.id,
  });

  let lastMessageTimestamp;
  let firstTime = true;

  $container.empty();

  // Loop for messages
  history.data.forEach((message) => {
    let divTime;
    let divName = null;

    const divMessage = document.createElement("div");
    divMessage.className = "message";

    // This is decide if the message should show time (if time between two messages bigger than 1 hour)
    if (!lastMessageTimestamp) {
      lastMessageTimestamp = Number(message.timestamp); // Save timestamp to a flag.
    } else {
      let savedDate = moment(lastMessageTimestamp);
      let messageDate = moment(Number(message.timestamp));

      // Get time between two messages.
      let timeDifferent = dateDifference(messageDate, savedDate, "hours");

      // If it bigger than 1 hour, add time.
      if (timeDifferent >= 1) {
        divTime = document.createElement("div");
        divTime.className = "time";
        divTime.innerText = moment(Number(message.timestamp)).format(
          "hh:mm A MM/DD/yyyy"
        );
      }

      // Save new timestamp to flag.
      lastMessageTimestamp = Number(message.timestamp);
    }

    // If the message is mine, add class message-me to show it is mine.
    if (message.senderID === myID) {
      $(divMessage).addClass("message-me");
    }

    const userInfo = getUserInfo(message.senderID, message.threadID);

    // If message's thread is a group and the message isn't mine. Add a name to it.
    if (message.isGroup && message.senderID !== myID) {
      const { element } = createName(userInfo.name);

      divName = element;
    }

    const { element: divContent } = createContent(message, userInfo);

    $(divMessage).append([
      divTime ? divTime : "",
      divName ? divName : "",
      divContent,
    ]);

    $container.append(divMessage);
  });

  if (firstTime) {
    container.scrollTop = container.scrollHeight;
    firstTime = false;
  } else if (
    container.scrollTop + container.clientHeight ===
    container.scrollHeight
  ) {
    container.scrollTop = container.scrollHeight;
  }

  function createName(name) {
    const divName = document.createElement("div");
    divName.className = "name";

    divName.innerText = name;

    return { name, element: divName };
  }

  function createContent(messageObj, userInfo) {
    const divContent = document.createElement("div");
    divContent.className = "content";

    let divThumbnail = null;

    if (userInfo.userID !== myID) {
      const { element } = createThumbnail(userInfo.profilePicture);

      divThumbnail = element;
    }

    const { element: divBody } = createBody(
      messageObj.body || messageObj.attachments || messageObj.snippet
    );

    $(divContent).append([divThumbnail ? divThumbnail : null, divBody]);

    return { element: divContent };

    function createBody(message) {
      const divMessage = document.createElement("div");
      divMessage.className = "body";

      // Message now is an array of attachments
      if (Array.isArray(message)) {
        message.forEach((attachment) => {
          const img = document.createElement("img");

          if (attachment.type === "photo") {
            $(divMessage).addClass("photo");

            img.src = attachment.largePreviewUrl;
            img.width = attachment.largePreviewWidth;

            $(divMessage).append(img);
          } else if (attachment.type === "sticker") {
            $(divMessage).addClass("sticker");

            img.src = attachment.url;
            img.width = attachment.width;
            img.height = attachment.height;

            $(divMessage).append(img);
          } else if (attachment.type === "share") {
            $(divMessage).addClass("share");

            divMessage.innerText = attachment.description;
          }
        });
      } else {
        $(divMessage).addClass("text");
        divMessage.innerText = message;
      }

      return { element: divMessage };
    }

    function createThumbnail(thumbnail) {
      const divThumbnail = document.createElement("div");
      divThumbnail.className = "thumb";

      const image = document.createElement("img");

      image.src = thumbnail;

      $(divThumbnail).append(image);

      return { thumbnail, element: divThumbnail };
    }
  }
}

function updateMessages(threadID) {
  const $bodyContainer = $(".conversation-body");

  if ($bodyContainer.data("id") !== threadID) return;

  console.log("Requested messages");

  requestMessages(threadID);
}

function sendMessage(message) {
  const $bodyContainer = $(".conversation-body");

  socket.emit("request--send-message", {
    message,
    id: $bodyContainer.data("id"),
  });
}

$(".send-btn").click(() => {
  const messageInput = $(".message-input");

  sendMessage(messageInput.val());

  messageInput.val("");
});

$(".message-input").keypress((e) => {
  if (e.which == 13) {
    //Enter key pressed
    $(".send-btn").click(); //Trigger search button click event
  }
});

function requestMessages(threadID) {
  socket.emit("request--thread-history", threadID); // Request messages from socket server.
}

function getUserInfo(senderID, threadID) {
  if (!threadList) return null;

  if (threadID) {
    const thread = threadList.find((thread) => thread.threadID === threadID);

    return thread.participants.find((user) => user.userID === senderID);
  }
}

function dateDifference(startDate, endDate, unit = "seconds") {
  return moment(startDate).diff(moment(endDate), unit);
}

$.fn.filterByData = function (prop, val) {
  return this.filter(function () {
    return $(this).data(prop) == val;
  });
};
