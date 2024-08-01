"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { PencilRuler } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { set, useForm } from "react-hook-form";

interface User {
  id: string;
  email: string;
  username: string;
}

interface IFormInput {
  email: string;
  password: string;
}

const Reset = () => {
  const router = useRouter();

  const routeHome = () => {
    router.push("/");
  };

  const [mode, setMode] = useState<"reset" | "verify">("verify");
  const [values, setValues] = useState(["", "", "", ""]);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [errMssg, setErrMssg] = useState("");
  const [errMssgColor, setErrMssgColor] = useState("text-gray-500");
  const [user, setUser] = useState<User | undefined>(undefined);
  const [resetCode, setResetCode] = useState<string | undefined>(undefined);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);

  async function onReset(values: z.infer<typeof formSchema>) {
    const { password } = values;

    if (!user || !resetCode) {
      setErrMssg("User or reset code not found");
      setErrMssgColor("text-red-500");
      return;
    }

    try {
      const resetResponse = await axios.post("/api/resetPassword", {
        userId: user.id,
        newPassword: password,
        resetCodeId: resetCode,
      });

      // Set the message color based on the status code
      if (resetResponse.status === 200) {
        setErrMssgColor("text-green-500");
      } else {
        setErrMssgColor("text-red-500");
      }

      setErrMssg(resetResponse.data.message);
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
    }

    // Clear the form.
    form.reset();
  }

  const formSchema = z.object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }) // Enforce minimum length
      .refine((value) => /[a-z]/.test(value), {
        message: "Password must contain at least one lowercase letter.",
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((value) => /\d/.test(value), {
        message: "Password must contain at least one number.",
      }),
  });

  // Define the form.
  const form = useForm<IFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

      const userResponse = await axios.get(
        `/api/getUserInfoById/${response.data.resetCode.userId}`
      );

      setUser(userResponse.data);
      setResetCode(response.data.resetCode.id);
      setErrMssg(response.data.message);
      setMode("reset");
      setErrMssg("");
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
    }
  };

  const routeAuth = () => {
    router.push("/auth");
  };
  
  useEffect(() => {
    // Check if all input boxes are filled
    setSubmitButtonDisabled(values.some((value) => value === ""));
  }, [values]);

  useEffect(() => {
    if (mode === "reset" && user) {
      // Prefill the email field when mode is reset and user is available
      form.setValue("email", user.email);
    }
  }, [mode, user, form]);

  return (
    <main className="w-full h-screen grid place-items-center pt-14">
      <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
        <PencilRuler
          onClick={routeHome}
          size={30}
          className="col-start-1 hover:cursor-pointer"
        />
      </nav>
      {mode === "verify" ? (
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
                  index === 0
                    ? firstInputRef
                    : index === 3
                    ? lastInputRef
                    : null
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
      ) : (
        <div className="flex flex-col items-center w-80 border-2 rounded-md p-12">
          <Form {...form}>
            <FormDescription className="mb-2 self-center text-center flex flex-col">
              <h1 className="text-black text-xl mb-4">
                Enter your new password
              </h1>
              <p className={`${errMssgColor} self-center text-lg`}>{errMssg}</p>
            </FormDescription>
            <form onSubmit={form.handleSubmit(onReset)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-gray-300 border-black"
                        placeholder=""
                        {...field}
                        disabled={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password{" "}
                      <span className="text-gray-500 italic">
                        Min length 8, at least one uppercase, one lowercase and
                        one number required
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Reset</Button>
              <p className="text-gray-500">
                Ready to&nbsp;
                <span
                  className="text-black text-semibold hover:underline cursor-pointer"
                  onClick={routeAuth}>
                  Login?
                </span>
              </p>
            </form>
          </Form>
        </div>
      )}
    </main>
  );
};

export default Reset;
