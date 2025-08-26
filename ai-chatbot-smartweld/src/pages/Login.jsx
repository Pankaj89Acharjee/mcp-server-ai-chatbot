import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { message } from "antd";
//import { login } from "../apicalls/loginAPICall";
import useAuth from "../customHooks/useAuth";
//import { jwtDecode } from "jwt-decode";


//REMEMBER HERE ALL COMMENTS ARE REAL CODE, AFTER RESUMING AWS SERVICE WE HAVE TO UN-COMMENT THIS CODE


const Login = () => {
  const { userLogin } = useAuth(); //Context
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const reference = useRef();

  useEffect(() => {
    reference.current.focus(); //Used to focus on input box while typing something on it
  }, []);

  // useEffect(() => {
  //   const isAuthenticatedUser = Cookies.get("_smartweld_Cookie");
  //   if (isAuthenticatedUser) {
  //     navigate("/dashboard", { replace: true });
  //   }
  // }, [navigate]);

  const submitLoginHandler = async (e) => {
    e.preventDefault();
    try {
      // console.log("Email Address", emailAddress, "Password", password);
      // const credentials = `${emailAddress}:${password}`;
      // const encodeCredentials = btoa(credentials);
      // const response = await login(encodeCredentials);

      const response = true

      //console.log("Response login", response)
      // if (response.success === true) {



      if (response === true) {
        message.success("Login Successful");
        //const accessToken = response?.token;

        const accessToken = 'a3ttyWyi!jsP0uybhYbGJk&iuinFG2';


        //const decodedToken = jwtDecode(accessToken);

        const decodedToken = accessToken

        //console.log("Decoded token", decodedToken)

        const expirationTime = new Date(new Date().getTime() + 1000 * 60 * 40); // 40 minutes from now

        const cookieData = {
          user_first_name: decodedToken?.user_first_name || "Pankaj",
          user_id: decodedToken?.id || 1,
          user_last_name: decodedToken?.user_last_name || "Acharjee",
          orgId: decodedToken?.org_id || 59,
          locationId: decodedToken?.location_id || 48,
          siteId: decodedToken?.site_id || 46,
          lineTypeId: decodedToken?.line_type_id || 44,
          roleId: decodedToken?.role_id || 3,
          roleName: decodedToken?.role_name || "SUPERVISOR",
          email: decodedToken?.user_email || "pankaj@ebiw.com",
        };

        userLogin(accessToken, cookieData, expirationTime);

        console.log("Expiration time", expirationTime);
        //console.log("Decoded token", decodedToken)

        setEmailAddress("");
        setPassword("");

        navigate("/dashboard");
        //navigate(from, { replace: true })
      } else {
        console.log("Resp err", response.response.data.message);
        message.error(response?.response?.data?.message);
      }
    } catch (error) {
      //console.log("Login error", error.message)
      message.error(error.message);
    }
  };

  return (
    <div className="container">
      <form onSubmit={submitLoginHandler}>
        <div className="flex justify-center mt-10 md:mt-14 py-7">
          <div className="relative flex flex-col text-gray-700 bg-white shadow-md w-96 rounded-xl bg-clip-border">
            <div className="relative grid mx-4 mb-4 -mt-6 overflow-hidden text-white shadow-lg h-28 place-items-center rounded-xl bg-gradient-to-tr from-blue-900 to-gray-900 bg-clip-border shadow-gray-900/20">
              <h3 className="flex font-sans text-3xl antialiased font-semibold leading-snug tracking-normal text-white">
                <span className="material-symbols-outlined text-6xl text-white items-center">
                  globe
                </span>
              </h3>
            </div>

            <div>
              <h1 className="items-center text-2xl font-serif text-gray-900 leading-0 mx-4 my-2 font-bold">
                Sign In
              </h1>
              <h1 className="mx-4 flex items-center text-gray-600">
                to continue to
                <span>
                  <h3 className="text-2xl ml-3">Smart Weld</h3>
                </span>
              </h1>
            </div>

            <div className="flex flex-col gap-4 p-6">
              <div className="relative h-11 w-full min-w-[200px]">
                <input
                  className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                  ref={reference}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  value={emailAddress}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Registered Email
                </label>
              </div>
              <div className="relative h-11 w-full min-w-[200px]">
                <input
                  className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                  placeholder=" "
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  required
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                  Password
                </label>
              </div>
            </div>
            <div className="p-6 pt-0">
              {/* After sign in, redirect the users to /home page */}
              <button
                data-ripple-light="true"
                className="block w-full select-none rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="submit"
              >
                Sign In
              </button>
              <p className="flex justify-center mt-6 font-sans text-sm antialiased font-light leading-normal text-inherit">
                Forgot password?
                <Link
                  to=" "
                  className="block ml-1 font-sans text-sm antialiased font-bold leading-normal text-blue-gray-900"
                >
                  Reset Password
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
