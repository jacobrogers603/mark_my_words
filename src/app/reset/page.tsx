"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { PencilRuler } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { set } from "react-hook-form";

const Reset = () => {
  const router = useRouter();

  const routeHome = () => {
    router.push("/");
  };

  const [values, setValues] = useState(["", "", "", ""]);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [errMssg, setErrMssg] = useState("");
  const [errMssgColor, setErrMssgColor] = useState("text-gray-500");
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the first input on page load
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    if (/^\d?$/.test(value)) {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);

      if (value && index < 3) {
        document.getElementById(`digit-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      document.getElementById(`digit-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = event.clipboardData.getData("text");
    if (/^\d{4}$/.test(pasteData)) {
      setValues(pasteData.split(""));
      event.preventDefault();
    }

    if (lastInputRef.current) {
      lastInputRef.current.focus();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrMssg("Checking code...");
    setErrMssgColor("text-amber-500");

    try {
      const response = await axios.post("/api/checkResetCode", {
        inputCode: values.join(""),
      });

      // Set the message color based on the status code
      if (response.status === 200) {
        setErrMssgColor("text-green-500");
      } else {
        setErrMssgColor("text-red-500");
      }

      const user = await axios.get(
        `/api/getUserInfoById/${response.data.resetCode.userId}`
      );

      setErrMssg(response.data.message);
    } catch (error) {
      // Handle error response
      setErrMssgColor("text-red-500");

      if (axios.isAxiosError(error) && error.response) {
        // Set the message from the response if available
        setErrMssg(error.response.data.message || "An error occurred");
      } else {
        // Fallback error message
        setErrMssg("An error occurred");
      }

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if all input boxes are filled
    setSubmitButtonDisabled(values.some((value) => value === ""));
  }, [values]);

  return (
    <main className="w-full h-screen grid place-items-center pt-14">
      <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
        <PencilRuler
          onClick={routeHome}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      </nav>
      <div className="flex flex-col items-center">
        <Label className="mb-4 text-2xl self-center" htmlFor="digits">
          Enter your reset code
        </Label>
        {errMssg ? (
          <div className="mb-4 text-center">
            <p role="alert" className={errMssgColor}>
              {errMssg}
            </p>
          </div>
        ) : null}
        <div id="digits" className="flex gap-2 mb-4">
          {values.map((value, index) => (
            <input
              key={index}
              id={`digit-${index}`}
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              maxLength={1}
              ref={
                index === 0 ? firstInputRef : index === 3 ? lastInputRef : null
              } // Set ref to the first and last inputs
              onPaste={index === 0 ? handlePaste : undefined} // Only allow pasting on the first input box
              className="w-12 h-12 text-center border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>
        <Button
          disabled={submitButtonDisabled}
          onClick={handleSubmit}
          className="w-[13.5rem]">
          Submit
        </Button>
      </div>
    </main>
  );
};

export default Reset;
