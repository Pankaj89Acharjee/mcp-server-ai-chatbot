// Context-API Implementation to hold states of some components

import React, { createContext, useContext, useState } from "react";

const StateContext = createContext();

const initialState = {
  chat: false,
  notification: false,
  userProfile: false,
  enableEditing: false
};

export const ContextProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(true) //Used for navbar toggling action
  const [isClicked, setIsClicked] = useState(initialState) //Used for Navbar menu icons to expand
  const [screenSize, setScreenSize] = useState(undefined) //Initially we don't know screen size, need to calculate screensize later in the component.
  const [currentColor, setCurrentColor] = useState('#03C9D7')
  const [currentTheme, setCurrentTheme] = useState('Light')
  const [themeSettings, setThemeSettings] = useState(false)

  const setTheme = (e) => {
    setCurrentTheme(e.target.value)
    localStorage.setItem('theme', e.target.value)
  }

  const setColor = (color) => {
    setCurrentColor(color)
    localStorage.setItem('color', color)
  }


  const handleClick = (clicked) => {
    setIsClicked({ ...initialState, [clicked]: true })
  }

  return (
    <StateContext.Provider value={{ activeMenu, setActiveMenu, isClicked, setIsClicked, handleClick, screenSize, setScreenSize, currentColor, currentTheme, themeSettings, setThemeSettings, setTheme, setColor}}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext); //Custom hook
