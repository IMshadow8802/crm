import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";
import chartFillImage from "../assets/Chart_fill.png";

import ratingsImage from "../assets/ratings.png"

// import chatImage from "../assets/Chat.png";
// import userImage from "../assets/User.png";
import calendarImage from "../assets/Calendar.png";
// import searchImage from "../assets/Search.png";
// import folderImage from "../assets/Folder.png";
// import settingImage from "../assets/Setting.png";
// import chartImage from "../assets/Chart.png";
// import controlImage from "../assets/control.png";
import { ChevronRightIcon, ChevronDownIcon, Bars3Icon } from "@heroicons/react/24/outline";
import useAuthStore from "../zustand/authStore";
import { useMediaQuery } from "react-responsive";

const Sidebar = () => {
  const navigate = useNavigate();
  const [MasterOpen, setMasterOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const logout = useAuthStore((state) => state.logout);

  let isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const Menus = [
    { title: "Dashboard", src: chartFillImage },
    {
      title: "Master",
      src: ratingsImage,
      submenus: [
        { title: "Leads", src: ratingsImage },
        { title: "Leads Status", src: ratingsImage },
        { title: "Contacts", src: ratingsImage },
        { title: "Complaint", src: ratingsImage },
        // { title: "Date Wise SalesReturn", src: ratingsImage },
        // { title: "Order Slot Wise", src: ratingsImage },
      ],
    },
    { title: "Kanban", src: calendarImage}
    // { title: "Search", src: searchImage },
    // { title: "Analytics", src: chartImage },
    // { title: "Inbox", src: chatImage },
    // { title: "Accounts", src: userImage },
    // { title: "Settings", src: settingImage, gap: true },
  ];

  const handleMenuClick = (title) => {
    if (title === "Master") {
      setMasterOpen(!MasterOpen);
    } else {
      navigate(`/${title.replace(/\s+/g, "_").toLowerCase()}`);
      setActiveMenu(title);
      setActiveSubmenu(null);
    }
  };

  const handleSubmenuClick = (submenuTitle) => {
    navigate(`/${submenuTitle.replace(/\s+/g, "_").toLowerCase()}`);
    setActiveMenu(null);
    setActiveSubmenu(submenuTitle);
  };

  const handleLogout = () => {
    // Clear access_token from local storage
    localStorage.removeItem("userData");
    logout();
    navigate("/login");
  };

  return (
    <div className="flex">
      {isMobile && (
        <div onClick={() => setSidebarVisible(!sidebarVisible)}>
          <Bars3Icon className="h-8 w-8 cursor-pointer top-12 left-7" />
        </div>
      )}
      {(!isMobile || sidebarVisible) && (
        <div
          className="w-72 bg-[#3F4FAF] p-5 pt-8 relative duration-300 font-sans rounded-xl h-screen z-50"
          style={{ maxHeight: "calc(100vh - 18px)" }}
        >
          <div className="flex gap-x-4 items-center">
            <img
              src={logoImage}
              className="cursor-pointer duration-500 rotate-[360deg]"
              alt="Logo"
            />
            <h1 className="text-white origin-left font-bold text-xl duration-200 font-sans">
              eCRM
            </h1>
          </div>
          <ul className="pt-6">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`relative group rounded-md p-2 cursor-pointer hover:bg-light-white text-white text-md font-semibold items-center gap-x-4 
              ${Menu.gap ? "mt-9" : "mt-2"} ${
                  Menu.title === activeMenu && "bg-light-white"
                } `}
                style={{
                  border:
                    Menu.title === activeMenu
                      ? "1px solid rgba(255,255,255,0.5)"
                      : "none",
                  borderRadius: Menu.title === activeMenu ? "8px" : "0",
                }}
              >
                <div
                  className="flex items-center relative"
                  onClick={() => handleMenuClick(Menu.title)}
                >
                  <img src={Menu.src} alt={Menu.title} className="text-white" />
                  <span className="origin-left duration-200">{Menu.title}</span>
                  {Menu.title === "Master" && (
                    <span className="ml-auto absolute right-0">
                      {MasterOpen ? (
                        <ChevronDownIcon className="h-4 w-4 text-white" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-white" />
                      )}
                    </span>
                  )}
                </div>
                {Menu.submenus && Menu.title === "Master" && (
                  <ul
                    className={`ml-[10px] mt-4 space-y-3 ${
                      MasterOpen ? "" : "hidden"
                    }`}
                  >
                    {Menu.submenus.map((submenu, subIndex) => (
                      <li
                        key={subIndex}
                        className={`relative group rounded-md p-2 cursor-pointer text-white text-md font-sans items-center gap-x-4 
                      ${submenu.title === activeSubmenu && "bg-light-white"}`}
                        style={{
                          border:
                            submenu.title === activeSubmenu
                              ? "1px solid rgba(255,255,255,0.5)"
                              : "none",
                          borderRadius:
                            submenu.title === activeSubmenu ? "8px" : "0",
                        }}
                      >
                        <div
                          className="flex items-center relative"
                          onClick={() => handleSubmenuClick(submenu.title)}
                        >
                          <img src={submenu.src} alt={submenu.title} />
                          <span>{submenu.title}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="absolute bottom-5 left-5">
            <button
              onClick={handleLogout}
              className="text-white text-md font-semibold hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
