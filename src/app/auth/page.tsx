"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useState } from "react";

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
  const [variant, setVariant] = useState<"signin" | "signup">("signin");
  const toggleVariant = () => {
    setVariant(variant === "signin" ? "signup" : "signin");
    form.reset();
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signin = () => {
    console.log("signin");
  };

  const signup = () => {
    console.log("signup");
  };

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Call the appropriate function based on the form variant.
    variant === "signin" ? signin() : signup();

    // Clear the form.
    form.reset();
    console.log(values);
  }

  return (
    <main className="grid place-items-center w-full h-screen">
      <div className="grid place-items-center border rounded-md w-80 h-auto p-12">
        <Form {...form}>
          <FormDescription className="text-black font-bold mb-8 ">
            {variant === "signin"
              ? "Sign in to your account"
              : "Create an account"}
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
                    <Input placeholder="" {...field} />
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
