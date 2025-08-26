import React, { useEffect } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { FaCalendarDay } from "react-icons/fa6";
import { MdAccessTime } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useDateSelectionContext } from '../contexts/DateSelectionContext';

import avatar from "../data/avatar.jpg";
import { Chat, Notification, UserProfile } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import useSessionStorage from "../customHooks/useSessionStorage";
import CalendarIcon from "./CalendarIcon";

const NavButtonToggler = ({
  title,
  customFunction,
  icon,
  colour,
  dotColour,
}) => (
  //Different button other than Context-API to handle closing/opening toggler of sidenav
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunction()}
      style={{ color: colour }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      {dotColour && (
        <span
          style={{ background: dotColour }}
          className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
        />
      )}
      {icon}
    </button>
  </TooltipComponent>
);

const DateShiftDisplay = ({ currentColor }) => {
  const { selectedDate, dateType, selectedShifts, getFormattedDate } = useDateSelectionContext();
  
  if (!selectedDate) return null;

  const formattedDate = getFormattedDate();
  
  // If no formatted date, don't render
  if (!formattedDate) return null;
  
  return (
    <div className="hidden md:flex items-center mr-4 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center">
        <FaCalendarDay className="text-lg mr-2" style={{ color: currentColor }} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {formattedDate.displayText}
        </span>
      </div>
      <div className="mx-2 h-4 w-px bg-gray-300 dark:bg-gray-600" />
      <div className="flex items-center">
        <MdAccessTime className="text-lg mr-2" style={{ color: currentColor }} />
        <div className="flex gap-1">
          {selectedShifts.map((shift) => (
            <span
              key={shift}
              className="px-2 py-0.5 text-xs font-medium rounded-full"
              style={{
                backgroundColor: `${currentColor}20`,
                color: currentColor,
              }}
            >
              Shift {shift}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const {
    setActiveMenu,
    isClicked,
    handleClick,
    screenSize,
    setScreenSize,
    currentColor,
  } = useStateContext();

  const { getSession } = useSessionStorage();

  useEffect(() => {
    const initialScreenSizeHandler = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", initialScreenSizeHandler);
    initialScreenSizeHandler();
    return () => window.removeEventListener("resize", initialScreenSizeHandler);
  }, [setScreenSize]);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize, setActiveMenu]);

  return (
    <div className="flex justify-between p-2 md:ml-2 md:mr-6">
      {/* Left side toggler button */}
      <NavButtonToggler
        title="Menu"
        customFunction={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)}
        colour={currentColor}
        icon={<AiOutlineMenu />}
      />

      <div className="flex items-center">
        {/* Date and Shift Display */}
        <DateShiftDisplay currentColor={currentColor} />

        {/* Calendar Button */}
        <NavButtonToggler
          title="Calendar"
          customFunction={() => handleClick("calendar")}
          colour={currentColor}
          icon={<FaCalendarDay />}
        />

        <NavButtonToggler
          title="Chat"
          dotColour="#03C9D7"
          customFunction={() => handleClick("chat")}
          colour={currentColor}
          icon={<BsChatLeft />}
        />

        <NavButtonToggler
          title="Notifications"
          dotColour="#03C9D7"
          customFunction={() => handleClick("notification")}
          colour={currentColor}
          icon={<RiNotification3Line />}
        />

        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
            onClick={() => handleClick("userProfile")}
          >
            <p>
              <span className="text-gray-400 text-14">Welcome!</span>{" "}
              <span className="text-pink-600 font-bold ml-1 text-lg">
                {getSession?.user_first_name || "Hi User"}
              </span>
            </p>
            <img
              src={avatar}
              className="rounded-full w-12 h-12 p-1 bg-slate-400"
              alt="user"
            />
          </div>
        </TooltipComponent>

        {isClicked?.chat && <Chat currentColor={currentColor} />}
        {isClicked?.notification && <Notification />}
        {isClicked?.userProfile && <UserProfile />}
        {isClicked?.calendar && <CalendarIcon />}
      </div>
    </div>
  );
};

export default Navbar;
