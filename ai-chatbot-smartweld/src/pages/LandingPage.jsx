import React from 'react'
import { Link } from 'react-router-dom'
import WeldingImgMobile from '../data/Welding_mobile.jpg'
import WeldingImgDesktop from '../data/Welding.jpg'

const Landingpage = () => {
  return (
    <div>

      <div className='container'>
        <main className="flex min-h-screen flex-col p-6">
          <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
            <span className="material-symbols-outlined text-5xl text-white items-center">
              globe
            </span>
            <h1 className='items-center text-5xl font-serif text-white leading-0 ml-2'>Smart Weld</h1>
          </div>
          <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
            <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
              <p className={`text-xl text-gray-800 md:text-3xl md:leading-normal`}>
                <strong>Welcome to Smartweld.</strong> Hi there!{' '}
                <a href="/" className="text-blue-500">
                  Smartweld Project
                </a>
                , powered by MQTT, helps generate your business ideas.
              </p>
              <Link
                to="/login"
                className="flex items-center gap-5 self-start rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 shadow-md shadow-gray-900/10 hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
                <span>Log in</span> <span className="material-symbols-outlined">
                  arrow_forward_ios
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
              {/* Hero Images Here */}
              <img
                src={WeldingImgDesktop}
                width={1000}
                height={760}
                className="hidden rounded-lg md:block"
                alt="Screenshots of the dashboard project showing desktop version"
              />
              <img
                src={WeldingImgMobile}
                width={560}
                height={620}
                className="block md:hidden"
                alt="Screenshot of the dashboard project showing mobile version"
              />
            </div>
          </div>
        </main>
      </div>
    </div>

  )
}

export default Landingpage