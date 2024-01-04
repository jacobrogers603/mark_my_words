import React from "react";
import { useState } from "react";
import Test from "./components/Test";
import NavBar from "./components/NavBar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <main className="w-screen h-screen bg-neutral-500">
        <NavBar />
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <Test />
      </main>
    </>
  );
}

export default App;
