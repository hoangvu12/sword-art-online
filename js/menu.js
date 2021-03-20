function handleMenuClick(e) {
  e.stopPropagation();

  let element = e.target;

  if (element.tagName !== "LI") {
    element = $(element).parents("li")[0] || element;
  }

  if (isLogOut(element)) {
    playSoundEffect("menuWarn", 0.3);
  }

  if (!$(element).find(".sub-menu").length) return;

  const $subMenu = $(element).children(".sub-menu");

  if ($(element).hasClass("active")) {
    clearActiveItem();
    clearNonActiveItems();

    closeSubMenu($subMenu.get(0));

    return;
  }

  clearActiveItem();
  clearNonActiveItems();
  addActiveItem();
  addInactiveItems();

  if ($subMenu.hasClass("sub-menu-close")) {
    $subMenu.removeClass("sub-menu-close").addClass("sub-menu-open");
  } else {
    $subMenu.removeClass("sub-menu-open").addClass("sub-menu-close");
  }

  if ($(element).parent().find(".sub-menu-open").length > 1) {
    clearNonActiveSubMenu();
  }

  openSubMenu($subMenu.get(0));

  function clearNonActiveSubMenu() {
    const $nonActiveSubMenu = $(element)
      .parent()
      .find('> :not(.active) [class*="menu-open"]');

    $nonActiveSubMenu.each((i, e) => {
      $(e).removeClass("sub-menu-open").addClass("sub-menu-close");
    });
  }

  function addInactiveItems() {
    const $nonActiveMenuItem = $(element).parent().find("> :not(.active)");

    $nonActiveMenuItem.each((i, e) => $(e).addClass("inactive"));
  }

  function addActiveItem() {
    $(element).addClass("active");
  }

  function clearNonActiveItems() {
    const $nonActiveMenuItem = $(element).parent().find(":not(.active)");

    $nonActiveMenuItem.each((i, e) => $(e).removeClass("inactive"));
  }

  function clearActiveItem() {
    const $activeMenuItem = $(element).parent().find(".active");

    $activeMenuItem.each((i, e) => $(e).removeClass("active"));
  }
}

function createMenu(options) {
  const { menu } = options;

  const ul = document.createElement("ul");
  ul.className = "primary-menu menu-close";

  $(ul).append(createMenuItem(menu));

  this.append(ul);

  resizeSubMenu();

  return {
    close: closeMenu,
    open: openMenu,
  };
}

function createMenuItem(items) {
  const elements = items.map((item) => {
    const { icon, subMenu = [] } = item;
    const li = document.createElement("li");
    const i = document.createElement("i");

    li.className = "primary-menu menu-item";

    if (item.onClick) {
      $(li).click(item.onClick);
    } else {
      $(li).append(createSubMenuItem(subMenu));
      $(li).click(handleMenuClick);
    }

    i.className = "icon material-icons";
    i.innerText = icon;

    $(li).append(i);

    return li;
  });

  return elements;
}

function createSubMenuItem(items) {
  const minimumItem = 3;

  let missingItem = minimumItem - items.length;

  const ul = document.createElement("ul");
  ul.className = "sub-menu sub-menu-close default";

  let elements = items.map((item) => {
    const li = document.createElement("li");
    const i = document.createElement("i");
    const span = document.createElement("span");

    li.className = "submenu-item";

    if (item.onClick) {
      $(li).click(item.onClick);
    } else {
      $(li).append(item.subMenu ? createSubMenuItem(item.subMenu) : "");
      $(li).click(handleMenuClick);
    }

    i.className = "icon material-icons";
    i.innerText = item.icon;

    span.innerText = item.name ? item.name : "";

    $(li).append(i);
    $(li).append(span);

    return li;
  });

  $(ul).append(elements);

  $(ul).append(missingItem > 0 ? generateMissingSubMenuItem(missingItem) : "");

  return ul;
}

function generateMissingSubMenuItem(amount) {
  let elements = [];
  for (let i = 0; i < amount; i++) {
    const li = document.createElement("li");
    const i = document.createElement("i");
    const span = document.createElement("span");

    li.className = "submenu-item";
    span.innerText = "???";

    i.className = "icon material-icons";
    i.innerText = "help_outline";

    $(li).append(i);
    $(li).append(span);

    elements.push(li);
  }

  return elements;
}

function isLogOut(el) {
  return $(el).find("i").text() === "logout";
}

function resizeSubMenu() {
  const subMenu = $(".sub-menu");

  subMenu.each((i, e) => {
    const menu = $(e);
    const parent = menu.parent();

    menu.css("left", parent.width() + 60);

    if (menu.children("li").length > 3) {
      menu.addClass("menu-scroll");
    }
  });
}

jQuery.fn.outerHTML = function () {
  return jQuery("<div />").append(this.eq(0).clone()).html();
};

jQuery.fn.extend({ menu: createMenu });
