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
  const [variant, setVariant] = useState<"signin" | "signup">("signin");
  const toggleVariant = () => {
    setVariant(variant === "signin" ? "signup" : "signin");
    form.reset();
    setErrMssg("");
  };

  const [errMssg, setErrMssg] = useState("");

  // Define the form.
  const form = useForm<IFormInput>({
    resolver: zodResolver(variant === "signup" ? signUpFormSchema : formSchema),
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
      setLoading(true);
      const loginResult = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push("/");
      } else {
        setErrMssg("Invalid Login");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setErrMssg("An error occurred during sign-in");
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      const signupResult = await axios.post("/api/signup", {
        email,
        password,
      });

      if (signupResult.status === 200) {
        signin(email, password);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
                  <FormLabel>
                    Password{" "}
                    {variant === "signup" ? (
                      <span className="text-gray-500 italic">
                        Min length 8, at least one uppercase, one lowercase and
                        one number required
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
