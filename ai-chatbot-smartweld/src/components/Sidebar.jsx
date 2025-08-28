import React from "react";
import { Link, NavLink } from "react-router-dom";
import { SiWebtrees } from "react-icons/si";
import { MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { sideNavMenuItems } from "../data/sidenavItems";
import { useStateContext } from "../contexts/ContextProvider";
import useAuth from "../customHooks/useAuth";


const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, currentColor } = useStateContext()
  const { auth } = useAuth()
 

 
  // Matching access of roles for logged in User
  const userHasRoleAccess = (rolesFromSideNav) => {
    if (!auth || !auth.role) return false;
    if (!rolesFromSideNav || !Array.isArray(rolesFromSideNav)) return false;
    return rolesFromSideNav.some((role) =>
      auth.role.toUpperCase() === role.toUpperCase()
    );
  };



  const handleCloseSideBar = () => {
    if (activeMenu && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const menuActiveStyle =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-gray-900  text-md m-2";
  const subMenuActiveStyle =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";

  return (
    <div className="h-screen ml-3 overflow-auto md:overflow-hidden md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          {/* For heading section of sidenav */}
          <div className="flex justify-between items-center">
            <Link
              to="/dashboard"
              className="flex items-center text-xl gap-4 ml-3 mt-4 font-extrabold tracking-tight dark:text-white text-slate-900"
              onClick={handleCloseSideBar}
            >
              <SiWebtrees className="text-5xl" /> <span>Smart Weld</span>
            </Link>

            {/* For Close button in small window*/}
            <TooltipComponent content="Menu" position="BottomCenter">
              <button
                type="button"
                onClick={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)}
                className="text-xl rounded-full p-3 hover:bg-pink-600 mt-4 mr-2 hover:transition-all hover:ease-in-out hover:duration-700 hover:text-white block md:hidden"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>

          {/* For Menu items of sidenav */}
          <div className="mt-10">
            {/* For main menu items */}
            {sideNavMenuItems
              .filter((menu) => userHasRoleAccess(menu.roles)) //Sidebar titles filtering by roles
              .map((items) => (
                <div key={items.title}>
                  <p className="text-gray-400 m-3 mt-4 uppercase">
                    {items.title}
                  </p>

                  {/* For submenu items */}
                  {items.links
                    .filter((subMenuTitles) => userHasRoleAccess(subMenuTitles.roles)) //Sidebar Sub title filtering by roles
                    .map((subMenus) => (
                      <NavLink
                        to={`/${subMenus.url}`}
                        key={subMenus.name}
                        onClick={handleCloseSideBar}
                        style={({ isActive }) => ({
                          backgroundColor: isActive ? currentColor : ''
                        })}
                        className={({ isActive }) =>
                          isActive ? menuActiveStyle : subMenuActiveStyle
                        }
                      >
                        {subMenus.icon}
                        <span className="capitalize">{subMenus.name}</span>
                      </NavLink>
                    ))}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
