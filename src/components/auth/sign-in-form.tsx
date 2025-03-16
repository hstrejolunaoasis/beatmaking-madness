"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { signInWithEmail } from "@/lib/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: SignInValues) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithEmail({
        email: data.email,
      });
      
      console.log("Magic link sign-in result:", result);
      setIsEmailSent(true);
    } catch (err: any) {
      console.error("Error signing in:", err);
      setError(err.message || "There was an error sending the magic link. Please try again.");
      form.setError("email", {
        type: "manual",
        message: err.message || "There was an error sending the magic link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {isEmailSent ? (
        <div className="flex flex-col space-y-4 text-center">
          <h3 className="font-bold text-xl">Check your email</h3>
          <p className="text-muted-foreground text-sm">
            We&apos;ve sent you a magic link to sign in to your account.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending magic link..." : "Sign In with Email"}
            </Button>
          </form>
          
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              No password required! We&apos;ll send you a magic link.
            </p>
          </div>
        </Form>
      )}
    </div>
  );
} 