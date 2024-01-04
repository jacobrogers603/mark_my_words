import React from "react";
import { useState } from "react";
import "./App.css";
import Test from "./components/Test"

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Test />
    </>
  );
}

export default App;
