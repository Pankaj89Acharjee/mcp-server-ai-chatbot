import React from 'react'
import { MdOutlineCancel } from 'react-icons/md'
import { BsCheck } from 'react-icons/bs'
import { TooltipComponent } from '@syncfusion/ej2-react-popups'
import { themeColors } from '../data/sidenavItems'
import { useStateContext } from '../contexts/ContextProvider'

const ThemeSettings = () => {

  const { setColor, setMode, currentMode, setThemeSettings, currentColor, setCurrentColor, currentTheme, setCurrentTheme, setTheme } = useStateContext();

  return (
    <div className='bg-half-transparent fixed nav-item top-0 right-0'>
      <div className='float-right h-screen dark:text-gray-200 bg-gray-200 dark:bg-gradient-to-l from-gray-700 to-gray-900 w-400 '>
        <div className="flex justify-between items-center p-4 ml-4">
          <p className="font-semibold text-lg mt-4">Settings</p>
          <button //Close Button
            type='button'
            onClick={() => setThemeSettings(false)}
            style={{ color: 'rgb(123, 171, 190)', borderRadius: '50%' }}
            className="text-2xl p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <MdOutlineCancel />
          </button>
        </div>

        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-xl ">Theme Options</p>
          <div className='mt-4'>
            <input
              type='radio'
              id='light'
              name='theme'
              value='Light'
              className='cursor-pointer'
              onChange={setTheme}
              checked={currentTheme === 'Light'}
            />
            <label
              htmlFor='light'
              className='ml-2 text-md cursor-pointer'
            >Light Theme</label>
          </div>

          <div className='mt-4'>
            <input
              type='radio'
              id='dark'
              name='theme'
              value='Dark'
              className='cursor-pointer'
              onChange={setTheme}
              checked={currentTheme === 'Dark'}
            />
            <label
              htmlFor='dark'
              className='ml-2 text-md cursor-pointer'
            >Dark Theme</label>
          </div>
        </div>

        <div className="flex-col border-t-1 border-color p-4 ml-4">
          <p className="font-semibold text-xl ">Color Options</p>
          <div className='flex gap-3'>
            {themeColors.map((item, index) => (
              <TooltipComponent key={index} content={item.name} position='TopCenter'>
                <div
                  className="relative mt-2 cursor-pointer flex gap-5 items-center"
                  key={item.name}
                >
                  <button
                    type="button"
                    className="h-10 w-10 rounded-lg cursor-pointer"
                    style={{ backgroundColor: item.color }}
                    onClick={() => setColor(item.color)}
                  >
                    <BsCheck className={`ml-2 text-2xl text-white ${item.color === currentColor ? 'block' : 'hidden'}`} />
                  </button>
                </div>
              </TooltipComponent>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ThemeSettings