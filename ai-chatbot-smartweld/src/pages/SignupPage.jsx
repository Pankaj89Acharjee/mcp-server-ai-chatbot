import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp, useClerk  } from "@clerk/clerk-react";
import { message } from 'antd'

const SignupPage = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [verifying, setVerifying] = React.useState(false);
    const [code, setCode] = useState("");

    const { signOut } = useClerk();
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoaded) {
            return;
        }

        // Start the sign-up process using the email and password provided
        try {
            await signUp.create({
                emailAddress,
                password,
            });

            // Send the user an email with the verification code
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            message.success(`Verification code sent to email: ${emailAddress}`)
            // Set 'verifying' true to display second form and capture the OTP code
            setVerifying(true);
        } catch (err) {
            if (err && err.errors && err.errors.length > 0) {
                const errorMessage = err.errors[0].message;
                message.error(errorMessage);
            } else {
                message.error("An error occurred. Please try again later.");
            }
        }
    };

    // This function will handle the user submitting a code for verification
    const handleVerify = async (e) => {
        e.preventDefault();
        if (!isLoaded) {
            return;
        }

        try {
            // Submit the code that the user provides to attempt verification
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status !== "complete") {
                // The status can also be `abandoned` or `missing_requirements`
                // Please see https://clerk.com/docs/references/react/use-sign-up#result-status for  more information
                message.error("There is some error, please try again with different password",)
                console.log(JSON.stringify(completeSignUp, null, 2));
            }

            // Check the status to see if it is complete
            // If complete, the user has been created -- set the session active
            if (completeSignUp.status === "complete") {
                localStorage.removeItem('clerk-db-jwt')
                message.info("Email verification successful")
                navigate('/login')
                // Handle your own logic here, like redirecting to a new page if needed.
            }
        } catch (err) {
            if (err && err.errors && err.errors.length > 0) {
                const errorMessage = err.errors[0].message;
                message.error(errorMessage);
            } else {
                message.error("An error occurred. Please try again later.");
            }
        }
    };

    return (
        <div>
            <div className='container'>
                {!verifying && (
                    <form>
                        <div className='flex justify-center mt-10 md:mt-14 py-7'>
                            <div className="relative flex flex-col text-gray-700 bg-white shadow-md w-96 rounded-xl bg-clip-border">
                                <div
                                    className="relative grid mx-4 mb-4 -mt-6 overflow-hidden text-white shadow-lg h-28 place-items-center rounded-xl bg-gradient-to-tr from-blue-900 to-gray-900 bg-clip-border shadow-gray-900/20">
                                    <h3 className="flex font-sans text-3xl antialiased font-semibold leading-snug tracking-normal text-white">
                                        <span className="material-symbols-outlined text-6xl text-white items-center">
                                            globe
                                        </span>
                                    </h3>
                                </div>

                                <div>
                                    <h1 className='items-center text-2xl font-serif text-gray-900 leading-0 mx-4 my-2 font-bold'>Sign Up</h1>
                                    <h1 className='mx-4 flex items-center text-gray-600'>to continue to<span><h3 className='text-2xl ml-3'>Smart Weld</h3></span></h1>
                                </div>

                                <div className="flex flex-col gap-4 p-6">
                                    <div className="relative h-11 w-full min-w-[200px]">
                                        <input
                                            className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                            placeholder=" "
                                            onChange={(e) => setEmailAddress(e.target.value)}
                                            id="email" name="email" type="email"
                                        />
                                        <label
                                            className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                            Email Address
                                        </label>
                                    </div>
                                    <div className="relative h-11 w-full min-w-[200px]">
                                        <input
                                            className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-0 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                            placeholder=" "
                                            onChange={(e) => setPassword(e.target.value)} id="password" name="password" type="password"
                                        />
                                        <label
                                            className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                            Password
                                        </label>
                                    </div>
                                </div>
                                <div className="p-6 pt-0">

                                    <button
                                        onClick={handleSubmit}
                                        data-ripple-light="true"
                                        className="block w-full select-none rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                        type="button">
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {verifying && (
                    <div className='flex justify-center mt-10 md:mt-14 py-7'>
                        <div className="relative flex flex-col text-gray-700 bg-white shadow-md w-96 rounded-xl bg-clip-border">
                            <div
                                className="relative grid mx-4 mb-4 -mt-6 overflow-hidden text-white shadow-lg h-28 place-items-center rounded-xl bg-gradient-to-tr from-blue-900 to-gray-900 bg-clip-border shadow-gray-900/20">
                                <h3 className="flex font-sans text-3xl antialiased font-semibold leading-snug tracking-normal text-white">
                                    <span className="material-symbols-outlined text-6xl text-white items-center">
                                        globe
                                    </span>
                                </h3>
                            </div>

                            <div>
                                <h1 className='items-center text-2xl font-serif text-gray-900 leading-0 mx-4 my-2 font-bold'>Email Verification</h1>
                                <h1 className='mx-4 text-xs text-center text-gray-600 mt-6'>Pls check your email for verification code</h1>
                            </div>
                            <div className="flex flex-col gap-4 p-6">
                                <div className="relative h-full w-full min-w-[200px]">
                                    <form>
                                        <input
                                            className="w-full h-full px-3 py-3 font-sans text-sm font-normal transition-all bg-transparent border rounded-md peer border-blue-gray-200 border-t-transparent text-blue-gray-700 outline outline-2 placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                                            value={code}
                                            placeholder=""
                                            onChange={(e) => setCode(e.target.value)}
                                            onClick={signOut}
                                        />
                                        <label
                                            className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[4.1] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
                                            Enter code received on email
                                        </label>



                                        <button
                                            data-ripple-light="true"
                                            className="block w-full select-none rounded-lg mt-7 bg-gradient-to-tr from-gray-900 to-gray-800 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                            type="button"
                                            onClick={handleVerify}>
                                            Verify Email
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SignupPage