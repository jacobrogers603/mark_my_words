"use client";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { on } from "events";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { log } from "console";

const formSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
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

const AuthPage = () => {
  const router = useRouter();
  const [variant, setVariant] = useState<"signin" | "signup">("signin");
  const toggleVariant = () => {
    setVariant(variant === "signin" ? "signup" : "signin");
    form.reset();
    setErrMssg("");
  };

  const [errMssg, setErrMssg] = useState("");

  // Define the form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signin = async (email: string, password: string) => {
    try {
      const loginResult = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      if(loginResult?.ok){
        router.push("/");
      }
      else{
        setErrMssg("Invalid Login");
      }
      
    } catch (error) {
      console.error("Error during sign-in:", error);
      setErrMssg("An error occurred during sign-in");
    }
  };
  

  const signup = async (email: string, password: string) => {
    try {
      await axios.post("/api/signup", {
        email,
        password,
      });
      
      signin(email, password);
    } catch (error) {
      console.error(error);
    }
  };

  // Define a submit handler. This will validate the data automatically.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Using a shadcn form library so we get the values the user typed into the inputs as follows:
    
    const { email, password } = values;

    // Call the appropriate function based on the form variant.
    variant === "signin" ? signin(email, password) : signup(email, password);

    // Clear the form.
    form.reset();
    setErrMssg("");
  }

  return (
    <main className="grid place-items-center w-full h-screen">
      <div className="grid place-items-center border rounded-md w-80 h-auto p-12">
        <Form {...form}>
          <FormDescription className="flex flex-col text-black font-bold mb-8 ">
            {variant === "signin"
              ? "Sign in to your account"
              : "Create an account"}
            <span className="text-red-500 self-center">
              {errMssg !== "" ? errMssg : ""}
            </span>
          </FormDescription>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {variant === "signin" ? "Sign in" : "Sign up"}
            </Button>
            <p className="text-gray-500">
              {variant === "signin"
                ? "Don't have an account? "
                : "Already have an account? "}
              <span
                onClick={toggleVariant}
                className="text-black text-semibold hover:underline cursor-pointer">
                {variant === "signin" ? " Create an Account" : " Login"}
              </span>
            </p>
          </form>
        </Form>
      </div>
    </main>
  );
};

export default AuthPage;
