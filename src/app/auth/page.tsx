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
import { useCallback, useEffect, useState } from "react";
import { on } from "events";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { log } from "console";
import { PencilRuler } from "lucide-react";

interface IFormInput {
  email: string;
  password: string;
}

const forgotFormSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
});

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const signUpFormSchema = formSchema.extend({
  password: formSchema.shape.password
    .min(8, { message: "Password must be at least 8 characters long" }) // Enforce length
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
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"signin" | "signup" | "forgot">(
    "signin"
  );
  const [errMssg, setErrMssg] = useState(["", "text-red-500"]);

  const toggleVariant = (targetVariant: "signin" | "signup" | "forgot") => {
    setVariant(targetVariant);
    form.reset();
    setErrMssg(["", "text-red-500"]);
  };

  // Define the form.
  const form = useForm<IFormInput>({
    resolver: zodResolver(
      variant === "signup"
        ? signUpFormSchema
        : variant === "signin"
        ? formSchema
        : variant === "forgot"
        ? forgotFormSchema
        : formSchema
    ),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    form.reset(
      {},
      {
        keepDefaultValues: true, // Adjust according to your needs
      }
    );
  }, [variant, form]);

  const signin = async (email: string, password: string) => {
    try {
      if (loading === false) {
        setLoading(true);
      }

      email = email.toLowerCase();
      const loginResult = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push("/");
      } else {
        setErrMssg(["Invalid Login", "text-red-500"]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setErrMssg(["An error occurred during sign-in", "text-red-500"]);
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      email = email.toLowerCase();
      setLoading(true);
      const signupResult = await axios.post("/api/signup", {
        email,
        password,
      });

      if (signupResult.status === 200) {
        signin(email, password);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const forgot = async (email: string) => {
    try {
      const userId = await axios.get(`/api/getUserIdFromEmail/${email}`);

      if (userId.status !== 200) {
        setErrMssg(["User not found", "text-red-500"]);
        return;
      }

      const resetCode = await axios.post("/api/generateResetCode", {
        userId: userId.data,
      });

      if (resetCode.status !== 200) {
        setErrMssg(["An error occurred", "text-red-500"]);
        return;
      }

      const emailSent = await axios.post("/api/sendResetEmail", {
        email,
        resetCode: resetCode.data.resetCode.resetCode,
      });
    } catch (error) {}
    setErrMssg(["Reset code sent", "text-green-500"]);
  };

  // Define a submit handler. This will validate the data automatically.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Using a shadcn form library so we get the values the user typed into the inputs as follows:

    const { email, password } = values;

    // Call the appropriate function based on the form variant.
    variant === "signin"
      ? signin(email, password)
      : variant === "signup"
      ? signup(email, password)
      : variant === "forgot"
      ? forgot(email)
      : null;

    // Clear the form.
    form.reset();
  }

  const routeAuth = () => {
    router.push("/auth");
  };

  if (loading)
    return (
      <main className="w-full h-screen grid place-items-center pt-14">
        <nav className="w-full h-14 absolute top-0 bg-amber-400 border-solid border-black border-b-2 grid grid-cols-8 place-items-center">
          <PencilRuler
            onClick={routeAuth}
            size={30}
            className="col-start-1 hover:cursor-pointer"
          />
        </nav>
        <div className="flex justify-center items-center w-auto h-10 p-4 border-solid rounded-md border-black border-2 text-black font-semibold bg-amber-400">
          Loading...
        </div>
      </main>
    );

  return (
    <main className="grid place-items-center w-full h-screen">
      <div className="grid place-items-center border rounded-md w-80 h-auto p-12">
        <Form {...form}>
          <FormDescription className="flex flex-col text-black font-bold mb-8 ">
            {variant === "signin"
              ? "Sign in to your account"
              : variant === "signup"
              ? "Create an account"
              : variant === "forgot"
              ? "Forgot Password"
              : ""}
            <span className={`${errMssg[1]} self-center`}>
              {errMssg[0] !== "" ? errMssg[0] : ""}
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
            {variant === "signin" || variant === "signup" ? (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password{" "}
                      {variant === "signup" ? (
                        <span className="text-gray-500 italic">
                          Min length 8, at least one uppercase, one lowercase
                          and one number required
                        </span>
                      ) : null}{" "}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <Button type="submit">
              {variant === "signin"
                ? "Sign in"
                : variant === "signup"
                ? "Sign up"
                : variant === "forgot"
                ? "Send Reset Email"
                : ""}
            </Button>
            <p className="text-gray-500">
              {variant === "signin"
                ? "Don't have an account? "
                : variant === "signup"
                ? "Already have an account? "
                : variant === "forgot"
                ? "Remembered your password?"
                : ""}
              <span
                onClick={(event: React.MouseEvent<HTMLSpanElement>) =>
                  variant === "signin"
                    ? toggleVariant("signup")
                    : variant === "signup"
                    ? toggleVariant("signin")
                    : variant === "forgot"
                    ? toggleVariant("signin")
                    : undefined
                }
                className="text-black text-semibold hover:underline cursor-pointer">
                {variant === "signin"
                  ? " Create an Account"
                  : variant === "signup"
                  ? " Login"
                  : variant === "forgot"
                  ? " Login"
                  : ""}
              </span>
            </p>
            {variant === "signin" ? (
              <p className="text-gray-500">
                <span
                  className="text-black text-semibold hover:underline cursor-pointer"
                  onClick={() => toggleVariant("forgot")}>
                  Forgot Password?
                </span>
              </p>
            ) : null}
          </form>
        </Form>
      </div>
    </main>
  );
};

export default AuthPage;
