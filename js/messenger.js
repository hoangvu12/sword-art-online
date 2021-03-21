let myID = "";
let threadList;
let lastMessageTimestamp;

let currentThread;

function showThreadList(list) {
  const $container = $(".messenger-conversations");

  $container.empty();

  threadList = list;

  // Loop through each thread
  $container.append(list.map((thread) => createThread(thread)));

  handleScroll($container);
}

function createThread(thread) {
  // Create a div thread container.
  const divContainer = document.createElement("div");
  divContainer.className = "conversation";

  if (currentThread === thread.threadID) {
    $(divContainer).addClass("conversation-active");
  }

  const thumbnail = thread.imageSrc || thread.participants[0].profilePicture;

  // Create info container
  const divInfo = createInfo(thread);

  // Create thumbnail container.
  const divThumbnail = createThumbnail(thumbnail);

  // If unread counter > 0 then add unread.
  if (thread.unreadCount > 0) {
    $(divContainer).addClass("conversation-unread");
  }

  // Add data to container.
  $(divContainer).data({
    name: thread.name,
    thumbnail,
    id: thread.threadID,
  });

  $(divContainer).append([divThumbnail, divInfo]);

  $(divContainer).click(() => {
    requestMessages(thread.threadID); // First request messages from server.
    removeActiveThreads(); // Remove active threads.
    addActiveThread(thread.threadID); // Add clicked thread to active state.
    currentThread = thread.threadID;
  });

  return divContainer;

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
    const divIcon = document.createElement("div");
    divIcon.className = "unread-icon";

    $(divInfo).append(divIcon);

    // Recent message.
    recentMessage.className = "recent-message";
    recentMessage.innerText = recentMsg;

    $(divInfo).append([divName, recentMessage]);

    return divInfo;
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
  const divThumbnail = createThumbnail(conversationEl.data("thumbnail"));

  // Name container
  const divName = createName(conversationEl.data("name"));

  $container.append([divThumbnail, divName]);
}

function showThreadMessages(history) {
  const $container = $(".conversation-body");
  const container = $container.get(0);

  $container.data({
    id: history.id,
  });

  $container.empty();

  $container.append(history.data.map((message) => createMessage(message)));

  scrollToLatestMessage();

  handleScroll($container);
}

function scrollToLatestMessage() {
  const $container = $(".conversation-body");
  const container = $container.get(0);

  container.scrollTop = container.scrollHeight;
}

function createMessage(message) {
  let divTime;
  let divName = null;

  const divMessage = document.createElement("div");
  divMessage.className = "message";

  if (isValidTime(message.timestamp)) {
    divTime = document.createElement("div");
    divTime.className = "time";
    divTime.innerText = moment(Number(message.timestamp)).format(
      "hh:mm A MM/DD/yyyy"
    );
  }

  // If the message is mine, add class message-me to show it is mine.
  if (message.senderID === myID) {
    $(divMessage).addClass("message-me");
  }

  const userInfo = getUserInfo(message.senderID, message.threadID);

  // If message's thread is a group and the message isn't mine. Add a name to it.
  if (message.isGroup && message.senderID !== myID) {
    divName = createName(userInfo.name);
  }

  const divContent = createContent(message, userInfo);

  $(divMessage).append([divTime, divName, divContent]);

  return divMessage;

  function createContent(messageObj, userInfo) {
    const divContent = document.createElement("div");
    divContent.className = "content";

    let divThumbnail = null;

    if (userInfo.userID !== myID) {
      divThumbnail = createThumbnail(userInfo.profilePicture);
    }

    const divBody = createBody(
      messageObj.body || messageObj.attachments || messageObj.snippet
    );

    $(divContent).append([divThumbnail, divBody]);

    return divContent;

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

      return divMessage;
    }
  }
}

function handleNewMessage(message) {
  updateMessage(message);
  updateThread(message);
}

function updateThread(message) {
  const conversationEl = $("*").filterByData("id", message.threadID).get(0);
  const conversationsContainer = $(".messenger-conversations").get(0);

  const firstChild = conversationsContainer.childNodes[0];

  conversationsContainer.insertBefore(conversationEl, firstChild);

  const userInfo = getUserInfo(message.senderID, message.threadID);

  let recentMsg;

  if (message.senderID === myID) {
    recentMsg = message.body;
  } else {
    recentMsg = `${userInfo.shortName}: ${message.body}`;
  }

  $(conversationEl)
    .addClass("conversation-unread")
    .find(".recent-message")
    .text(recentMsg);
}

function updateMessage(message) {
  const $bodyContainer = $(".conversation-body");

  if ($bodyContainer.data("id") !== message.threadID) return;

  const divMessage = createMessage(message);

  $bodyContainer.append(divMessage);
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

  scrollToLatestMessage();
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

function isValidTime(timestamp) {
  // This is decide if the message should show time (if time between two messages bigger than 1 hour)
  if (!lastMessageTimestamp) {
    lastMessageTimestamp = Number(timestamp); // Save timestamp to a flag.

    return false;
  }

  let savedDate = moment(lastMessageTimestamp);
  let messageDate = moment(Number(timestamp));

  // Get time between two messages.
  let timeDifferent = dateDifference(messageDate, savedDate, "hours");

  // Save new timestamp to flag.
  lastMessageTimestamp = Number(timestamp);

  // If it bigger than 1 hour, add time.
  if (timeDifferent >= 1) return true;

  return false;
}

function createThumbnail(thumbnail) {
  const divThumbnail = document.createElement("div");
  divThumbnail.className = "thumb";

  const image = document.createElement("img");

  image.src = thumbnail;

  $(divThumbnail).append(image);

  return divThumbnail;
}

function createName(name) {
  const divName = document.createElement("div");
  divName.className = "name";

  divName.innerText = name;

  return divName;
}

function dateDifference(startDate, endDate, unit = "seconds") {
  return moment(startDate).diff(moment(endDate), unit);
}

function handleScroll(container) {
  let isDown = false;
  let startY;
  let scrollTop;

  container.mousedown((e) => {
    isDown = true;
    startY = e.pageY - container.offset().top;
    scrollTop = container.scrollTop();
  });

  container.mouseleave(() => {
    isDown = false;
  });

  container.mouseup(() => {
    isDown = false;
  });

  container.mousemove((e) => {
    if (!isDown) return;

    e.preventDefault();

    const y = e.pageY - container.offset().top;

    const distance = (y - startY) * 1.2;

    container.scrollTop(scrollTop - distance);
  });
}

$.fn.filterByData = function (prop, val) {
  return this.filter(function () {
    return $(this).data(prop) === val;
  });
};
