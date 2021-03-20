const ui_ready = (options) => {
  welcome();

  if (options.clock) openClock();
  if (options.calendar) calendar();

  window.addEventListener(
    "offline",
    function (e) {
      $(".popup-container").popup({
        title: "Lỗi",
        message: "Mất kết nôi! Vui lòng thử lại.",
        icon: "error",
      });
    },
    false
  );
};
