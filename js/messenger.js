let threadList;
let lastMessageTimestamp;

let currentThread;
let threadMessages = {};

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
    if (!(thread.threadID in threadMessages)) {
      requestMessages(thread.threadID); // First request messages from server.
    } else {
      showThreadMessages(threadMessages[thread.threadID]);
      showThreadHeader(thread.threadID);
    }

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

    // Find info from who sent the last message.
    let snippetSender = info.participants.find(
      (user) => user.userID === info.snippetSender
    );

    // Decide to show what recent message should show.
    if (info.isGroup) {
      let name;

      // If it was me, show "You" instead of my name.
      if (info.snippetSender === myID) {
        name = "You";
      } else {
        name = snippetSender.shortName;
      }

      recentMsg = `${name}: ${info.snippet}`;
    } else {
      if (info.snippetSender === myID && !info.snippet.includes("You")) {
        recentMsg = `You: ${info.snippet}`;
      } else {
        recentMsg = info.snippet;
      }
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

  $container.data({
    id: history.id,
  });

  if (!(history.id in threadMessages)) {
    threadMessages[history.id] = history; // Save thread messages to memory.
  }

  $container.empty();

  $container.append(
    history.data
      .filter((message) => message.type === "message")
      .map((message) => createMessage(message))
  );

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

  const divReader = document.createElement("div");
  divReader.className = "reader";

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

  $(divMessage).append([divTime, divName, divContent, divReader]);

  return divMessage;

  function createContent(messageObj, userInfo) {
    const divContent = document.createElement("div");
    divContent.className = "content";

    let divThumbnail = null;

    if (userInfo.userID !== myID) {
      divThumbnail = createThumbnail(userInfo.profilePicture);
    }

    const divBody = createBody(messageObj);

    $(divContent).append([divThumbnail, divBody]);

    return divContent;

    function createBody(message) {
      const attachmentTypes = {
        photo: (container, attachment) => {
          $(container).addClass("photo");

          $(container).append(imageBasedAttachment(attachment));
        },
        sticker: (container, attachment) => {
          $(container).addClass("sticker");

          $(container).append(imageBasedAttachment(attachment));
        },
        share: (container, attachment) => {
          $(container).addClass("share");

          const span = document.createElement("span");
          span.innerText = attachment.description;

          $(container).append(span);
        },
      };

      const divMessage = document.createElement("div");
      divMessage.className = "body";

      if (message.body) {
        const span = document.createElement("span");
        span.innerText = message.body;

        $(divMessage).addClass("text");
        $(divMessage).append(span);
      }

      // Message now is an array of attachments
      if (Array.isArray(message.attachments)) {
        message.attachments
          .filter((attachment) => attachment.type in attachmentTypes)
          .forEach((attachment) => {
            attachmentTypes[attachment.type](divMessage, attachment);
          });
      }

      return divMessage;

      function imageBasedAttachment(attachment) {
        const img = document.createElement("img");

        img.src = attachment.url;

        if (attachment.type === "sticker") {
          img.width = attachment.width / 2;
          img.height = attachment.height / 2;
        } else {
          img.width = attachment.width;
          img.height = attachment.height;
        }

        return img;
      }
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
  const $bodyContainer = $(".conversation-body");

  const firstChild = conversationsContainer.childNodes[0];

  conversationsContainer.insertBefore(conversationEl, firstChild);

  const userInfo = getUserInfo(message.senderID, message.threadID);

  let recentMsg;

  let additionalMsg;

  if (message.body) {
    if (message.senderID === myID) {
      recentMsg = `You: ${message.body}`;
    } else {
      recentMsg = `${userInfo.shortName}: ${message.body}`;
    }
  } else if (message.attachments[0]?.type === "photo") {
    if (message.senderID === myID) {
      recentMsg = "You sent photo(s).";
    } else {
      recentMsg = `${userInfo.shortName} sent photo(s)`;
    }
  } else if (message.attachments[0]?.type === "sticker") {
    const attachment = message.attachments[0];

    const img = document.createElement("img");

    img.src = attachment.url;

    additionalMsg = img;

    if (message.senderID === myID) {
      recentMsg = "You: ";
    } else {
      recentMsg = `${userInfo.shortName}: `;
    }
  }

  if ($bodyContainer.data("id") !== message.threadID) {
    $(conversationEl).addClass("conversation-unread");
  }

  const recentMessage_div = $(conversationEl).find(".recent-message");

  recentMessage_div.text(recentMsg);

  if (additionalMsg) recentMessage_div.append(additionalMsg);
}

function updateMessage(message) {
  const $bodyContainer = $(".conversation-body");

  const savedMessages = threadMessages[message.threadID]?.data || [];

  savedMessages.push(message);

  if ($bodyContainer.data("id") !== message.threadID) return;

  const divMessage = createMessage(message);

  $bodyContainer.append(divMessage);

  if (message.senderID === myID) {
    scrollToLatestMessage();
  }
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

$.fn.filterByData = function (prop, val) {
  return this.filter(function () {
    return $(this).data(prop) === val;
  });
};

function isEmptyArray(array) {
  return JSON.stringify(array) === "[]";
}
