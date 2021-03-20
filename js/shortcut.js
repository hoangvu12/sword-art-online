{
  /* <div class="menu-item">
        <i class="icon material-icons">calendar_today</i>
    </div> */
}

function shortcut(options) {
  const $container = this;

  const divContainer = document.createElement("div");
  const divItem = document.createElement("div");
  const icon = document.createElement("i");

  $(divContainer).addClass("shortcut");
  $(divItem).addClass("menu-item");
  $(icon).addClass("icon material-icons");

  $(icon).text(options.icon || "help_outline");

  if (options.class) {
    $(divContainer).addClass(options.class);
  }

  if (!options.autostart) {
    $(options.target).addClass("close");
  }

  $(divItem).click(() => defaultClick(options.target));

  $(divItem).append(icon);
  $(divContainer).append(divItem);

  $container.append(divContainer);

  showShortcutList();
}

function defaultClick(target) {
  if ($(target).hasClass("close")) {
    openShortcutAnimation(target);
  } else {
    closeShortcutAnimation(target);
  }
}

jQuery.fn.extend({ shortcut });
