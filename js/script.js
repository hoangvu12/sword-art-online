$(() => {
  ui_ready({
    clock: true,
    calendar: true,
  });

  $(".calendar-container").shortcut({
    target: ".calendar",
    icon: "today",
    autostart: false,
  });

  $(".messenger-container").shortcut({
    icon: "forum",
    target: ".messenger",
    autostart: false,
  });

  let menu = $(".menu-container").menu({
    menu: [
      {
        icon: "person",
        subMenu: [
          {
            icon: "shopping_basket",
            name: "Items",
            subMenu: [
              {
                icon: "shopping_basket",
                name: "Items",
              },
            ],
          },
        ],
      },
      {
        icon: "school",
        subMenu: [
          {
            icon: "date_range",
            name: "Thời khóa biểu",
            onClick: () => {
              $(".popup-container").popup({
                title: "Thời khóa biểu",
                message: "T2: Bla bla",
                icon: "info",
              });

              menu.close();
            },
          },
        ],
      },
      {
        icon: "settings",
        subMenu: [
          {
            icon: "construction",
            name: "Tùy chọn",
            subMenu: [
              {
                icon: "headphones",
                name: "Âm lượng",
                subMenu: [
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                  {
                    icon: "shopping_basket",
                    name: "Items",
                  },
                ],
              },
            ],
          },
          { icon: "info", name: "Trợ giúp" },
          { icon: "logout" },
        ],
      },
      {
        icon: "add",
        onClick: () => {
          $(".popup-container").popup({
            title: "Thời khóa biểu",
            message: "T2: Bla bla",
            icon: "info",
          });

          menu.close();
        },
      },
    ],
  });
});
