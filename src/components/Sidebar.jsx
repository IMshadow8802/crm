import React from "react";
import { useNavigate } from "react-router-dom";
import controlImage from "../assets/control.png";
import logoImage from "../assets/logo.png";
import chartFillImage from "../assets/Chart_fill.png";
import chatImage from "../assets/Chat.png";
import userImage from "../assets/User.png";
import calendarImage from "../assets/Calendar.png";
import searchImage from "../assets/Search.png";
import chartImage from "../assets/Chart.png";
import folderImage from "../assets/Folder.png";
import settingImage from "../assets/Setting.png";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const Sidebar = () => {
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(true);
  const [mastersOpen, setMastersOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState(null);

  const Menus = [
    { title: "Dashboard", src: chartFillImage },
    {
      title: "Masters",
      src: folderImage,
      submenus: [
        { title: "Accounts", src: userImage },
        { title: "Schedule", src: calendarImage },
      ],
    },
    { title: "Kanban", src: calendarImage,gap:true  },
    { title: "Search", src: searchImage},
    { title: "Analytics", src: chartImage },
    { title: "Inbox", src: chatImage},
    { title: "Accounts", src: userImage },
    { title: "Settings", src: settingImage,gap:true },
  ];


  const handleMenuClick = (title) => {
    if (title === "Masters") {
      setMastersOpen(!mastersOpen);
    } else {
      navigate(`/${title.toLowerCase()}`);
      setActiveMenu(title);
      setActiveSubmenu(null);
    }
  };

  const handleSubmenuClick = (submenuTitle) => {
    navigate(`/${submenuTitle.toLowerCase()}`);
    setActiveMenu(null);
    setActiveSubmenu(submenuTitle);
  };

  return (
    <div className="flex">
      <div
        className={` ${
          open ? "w-72" : "w-20 "
        } bg-[#3F4FAF] p-5  pt-8 relative duration-300 font-sans rounded-lg h-screen`}
      >
        <img
          src={controlImage}
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple
           border-2 rounded-full  ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />
        <div className="flex gap-x-4 items-center">
          <img
            src={logoImage}
            className={`cursor-pointer duration-500 ${
              open && "rotate-[360deg]"
            }`}
            alt="Logo"
          />
          <h1
            className={`text-white origin-left font-medium text-xl duration-200 font-sans ${
              !open && "scale-0"
            }`}
          >
            eCRM
          </h1>
        </div>
        <ul className="pt-6">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`relative group rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-md font-sans items-center gap-x-4 
              ${Menu.gap ? "mt-9" : "mt-2"} ${
                Menu.title === activeMenu && "bg-light-white"
              } `}
              style={{
                border: Menu.title === activeMenu ? "1px solid rgba(255,255,255,0.5)" : "none",
                borderRadius: Menu.title === activeMenu ? "8px" : "0",
              }}
            >
              <div
                className="flex items-center relative"
                onClick={() => handleMenuClick(Menu.title)}
              >
                <img src={Menu.src} alt={Menu.title} />
                <span
                  className={`${!open && "hidden"} origin-left duration-200`}
                >
                  {Menu.title}
                </span>
                {Menu.title === "Masters" && (
                  <span className="ml-auto absolute right-0">
                    {mastersOpen ? (
                      <ChevronDownIcon className="h-4 w-4 text-white" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-white" />
                    )}
                  </span>
                )}
              </div>
              {Menu.submenus && Menu.title === "Masters" && open && (
                <ul
                  className={`ml-[10px] mt-4 space-y-3 ${
                    mastersOpen ? "" : "hidden"
                  }`}
                >
                  {Menu.submenus.map((submenu, subIndex) => (
                    <li
                      key={subIndex}
                      className={`relative group rounded-md p-2 cursor-pointer text-gray-300 text-md font-sans items-center gap-x-4 
                      ${submenu.title === activeSubmenu && "bg-light-white"}`}
                      style={{
                        border: submenu.title === activeSubmenu ? "1px solid rgba(255,255,255,0.5)" : "none",
                        borderRadius: submenu.title === activeSubmenu ? "8px" : "0",
                      }}
                    >
                      <div
                        className="flex items-center relative"
                        onClick={() => handleSubmenuClick(submenu.title)}
                      >
                        <img src={submenu.src} alt={submenu.title} />
                        <span
                          className={`${
                            !open && "hidden"
                          } origin-left duration-200`}
                        >
                          {submenu.title}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
