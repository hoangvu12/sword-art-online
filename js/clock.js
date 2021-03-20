const $timeContainer = $(".time-container");
const $dateContainer = $(".date-container");

const updateClock = () => {
  const time = moment().format("LT");
  const date = moment().format("MMM DD");

  $timeContainer.text(time);
  $dateContainer.text(date);
};

setInterval(updateClock, 1000);
updateClock();
