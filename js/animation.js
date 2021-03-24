const primaryMenu = "ul.primary-menu";
const $body = $("body");

let hasOpened = false,
  hasClosed = false;

function clearActiveItem() {
  const $activeMenuItem = $(".menu-container").find(".active");
  const $inactiveMenuItem = $(".menu-container").find(".inactive");

  $activeMenuItem.each((i, e) => $(e).removeClass("active"));
  $inactiveMenuItem.each((i, e) => $(e).removeClass("inactive"));
}

function clearNonActiveSubMenu() {
  const $nonActiveSubMenu = $(".menu-container").find(
    '> :not(.active) [class*="menu-open"]'
  );

  $nonActiveSubMenu.each((i, e) => {
    $(e).removeClass("sub-menu-open").addClass("sub-menu-close");
  });
}

function clearActiveSubMenu(menu) {
  const $activeSubMenu = $(menu).parent().find(".sub-menu-open");

  $activeSubMenu.each((i, e) => {
    $(e).removeClass("sub-menu-open").addClass("sub-menu-close");
  });
}

// Calendar
function showShortcutList() {
  const shortcutContainers = $(".shortcut").parent().get();

  anime
    .timeline({
      targets: shortcutContainers,
    })
    .add({
      opacity: [0, 1],
      translateX: ["200px", 0],
      duration: 2000,
    });
}

// Welcome
function welcome() {
  $(".popup-container").popup({
    title: "Tin nhắn",
    message: "Hệ thống khởi động thành công.",
    noButton: true,
    endDelay: 4000,
    icon: "success",
  });

  anime
    .timeline({
      targets: ".welcome-text",
      easing: "linear",
    })
    .add({
      opacity: [0, 1],
      width: ["0vw", "100vw"],
      duration: 1500,
      endDelay: 2000,
    })
    .add({
      width: ["100vw", "0vw"],
      opacity: [1, 0],
      duration: 1500,
    });
}

// Clock
function openClock() {
  anime
    .timeline({
      targets: ".clock-container",
    })
    .add({
      opacity: [0, 1],
      translateX: ["60px", 0],
      duration: 2000,
    });
}

// Popup
function openPopup(popup) {
  anime
    .timeline({
      targets: popup,
    })
    .add({
      opacity: [0, 1],
      easing: "linear",
      duration: 300,
    })
    .add(
      {
        translateY: ["-200px", 0],
        duration: 700,
      },
      "-=500"
    );
}

function closePopup(popup) {
  anime
    .timeline({ targets: popup })
    .add({
      translateY: "-200px",
      // easing: "linear",
      duration: 700,
    })
    .add(
      {
        opacity: [1, 0],
        easing: "linear",
        duration: 500,
        complete: () => {
          popup.remove();
        },
      },
      "-=1000"
    );
}

// Menu related
function openSubMenu(menu) {
  playSoundEffect("menuClick");

  anime
    .timeline({ targets: menu })
    .add({
      opacity: [0, 1],
      easing: "linear",
      duration: 300,
    })
    .add(
      {
        translateY: ["-200px", 0],
        duration: 700,
      },
      "-=500"
    );
}

function closeSubMenu(menu) {
  playSoundEffect("menuClick");

  anime
    .timeline({ targets: menu })
    .add({
      translateY: "-200px",
      // easing: "linear",
      duration: 700,
    })
    .add(
      {
        opacity: [1, 0],
        easing: "linear",
        duration: 500,
        complete: () => {
          clearActiveSubMenu(menu);
        },
      },
      "-=1000"
    );
}

function openMenu() {
  if (hasOpened) return;

  $body.addClass("darken");

  playSoundEffect("menuOpen", 0.3);

  const primaryMenuItem = document.querySelectorAll(".primary-menu.menu-item");

  hasOpened = true;

  anime
    .timeline({
      autoplay: true,
    })
    .add({
      targets: primaryMenu,
      opacity: [0, 1],
      duration: 500,
      easing: "linear",
    })
    .add({
      targets: primaryMenu,
      translateY: 150,
      duration: 500,
    })
    .add({
      targets: primaryMenuItem,
      marginBottom: ["-60px", "28px"],
      duration: 1500,
      complete: () => {
        $(primaryMenu).removeClass("menu-loading").addClass("menu-open");
      },
    });

  hasClosed = false;
}

function closeMenu() {
  if (hasClosed) return;

  clearActiveItem();
  clearNonActiveSubMenu();

  $body.removeClass("darken");

  playSoundEffect("menuClose", 0.3);

  const primaryMenuItem = document.querySelectorAll(".primary-menu.menu-item");

  hasClosed = true;

  anime
    .timeline({
      targets: primaryMenu,
      autoplay: true,
    })
    .add({
      targets: primaryMenuItem,
      marginBottom: "-60px",
      duration: 500,
      easing: "easeInOutSine",
      endDelay: 200,
    })
    .add({
      translateY: 0,
      duration: 500,
    })
    .add({
      opacity: 0,
      duration: 500,
      easing: "linear",
      complete: () => {
        $(primaryMenu).removeClass("menu-loading").addClass("menu-close");
      },
    });

  hasOpened = false;
}

function closeShortcutAnimation(el) {
  playSoundEffect("menuClick");

  anime
    .timeline({ targets: el })
    .add({
      translateY: "-200px",
      // easing: "linear",
      duration: 700,
    })
    .add(
      {
        opacity: [1, 0],
        easing: "linear",
        duration: 500,
        complete: () => {
          $(el).addClass("close");
        },
      },
      "-=1000"
    );
}

function openShortcutAnimation(el) {
  playSoundEffect("menuClick");

  $(el).removeClass("close");

  anime
    .timeline({ targets: el })
    .add({
      opacity: [0, 1],
      easing: "linear",
      duration: 300,
    })
    .add(
      {
        translateY: ["-200px", 0],
        duration: 700,
      },
      "-=500"
    );
}

$(".menu-container").swipe({
  swipe: function (event, direction) {
    if (!$(event.target).hasClass("menu-container")) return;

    let options = {
      up: closeMenu,
      down: openMenu,
    };

    if (!(direction in options)) return;

    $(primaryMenu).removeClass("menu-open menu-close").addClass("menu-loading");

    options[direction]();
  },
});
