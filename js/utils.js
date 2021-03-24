function handleScroll(container) {
  let isDown = false;
  let startY;
  let scrollTop;

  container.mousedown((e) => {
    e.stopPropagation();

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
