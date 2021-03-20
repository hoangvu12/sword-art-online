function createPopup(options) {
  const {
    title,
    message,
    onAgree = defaultAgreeClick,
    onDisagree = defaultDisagreeClick,
    icon,
  } = options;

  const iconName = getIcon(icon);

  const div = document.createElement("div");
  div.className = "window";

  $(div).append(`
    <div class="title">${title}</div>
    <div class="message">
        <div class="icon">
          <span class="material-icons">
            ${iconName}
          </span>
        </div>
        <span>${message}</span>
    </div>
    
    <div class="actions">
        <div class="button-wrapper">
            ${!options.noButton ? `<div class="button button-yes"></div>` : ""}
        </div>
        <div class="button-wrapper">
            ${!options.noButton ? `<div class="button button-no"></div>` : ""}
        </div>
    </div>
  `);

  if (!options.noButton) {
    $(div).find(".button").click(handleClick);
  }

  this.append(div);

  openPopup(div);

  if (options.endDelay) {
    setTimeout(() => closePopup(div), options.endDelay);
  }

  return {
    remove: div.remove,
  };

  function handleClick(e) {
    const element = e.target;

    if (element.className.includes("yes")) {
      return onAgree(div);
    }

    onDisagree(div);
  }
}

function defaultDisagreeClick(el) {
  closePopup(el);
}

function defaultAgreeClick() {}

function getIcon(iconName = "error") {
  const icons = {
    info: "error_outline",
    success: "done",
    error: "clear",
  };

  return icons[iconName];
}

jQuery.fn.extend({ popup: createPopup });
