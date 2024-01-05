import React from "react";
import { useState } from "react";
import Test from "./components/Test";
import NavBar from "./components/NavBar";
import SignIn from "./components/SignIn";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <main className="grid place-items-center w-screen h-screen bg-neutral-500">
        <SignIn />
      </main>
    </>
  );
}

export default App;
