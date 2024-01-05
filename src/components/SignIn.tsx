import React, { useState } from "react";

const SignIn = () => {
  const [loginType, setLoginType] = useState("login");

  return (
    <div className="grid place-items-center bg-gray-100 px-6 py-6 border rounded-md max-w-96">
      {/* slider system register vs login*/}
      <div
        className="grid grid-cols-2 place-items-center rounded-md bg-gray-300 py-2 relative mb-2 w-3/4"
        onClick={() =>
          setLoginType(loginType === "login" ? "register" : "login")
        }>
        {/* Slider Box itself, indicating which side is active */}
        <div
          className={`absolute left-0 w-1/2 h-full bg-amber-500 rounded-md transition-transform duration-1000 ${
            loginType === "login" ? "translate-x-0" : "translate-x-full"
          }`}></div>
        <h3
          className={`z-10 pl-4 pr-4 cursor-default ${
            loginType === "login" ? "text-white font-bold" : "text-gray-200"
          }`}>
          Login
        </h3>
        <h3
          className={`z-10 pl-4 pr-4 cursor-default ${
            loginType === "register" ? "text-white font-bold" : "text-gray-200"
          }`}>
          Register
        </h3>
      </div>

      <form action="#">
        <div className="">
          <div>
            <label className="block" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              placeholder="Email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="mt-4">
            <label className="block">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div className="flex items-baseline justify-between">
            <button className="px-6 py-2 mt-4 text-white font-bold bg-blue-500 rounded-lg hover:bg-blue-900">
              Submit
            </button>
            {loginType === 'login' ? <a href="#" className="text-sm text-blue-400 hover:underline">
              Forgot password?
            </a> : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
