"use client";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { OctagonAlertIcon, GitBranch } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const SignInView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="space-y-8 p-8 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200/10 bg-transparent">
                <Image src="/logol.svg" alt="LainAI logo" width={48} height={48} className="h-10 w-10 object-contain" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">LainAI</p>
                <p className="text-xs text-muted-foreground">Your AI workspace for agents and chats</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back to LainAI
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              Sign in to access your agents, continue conversations, and keep your workspace in sync across devices.
            </p>
          </div>

          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hello@example.com" {...field} />
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
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button
                  disabled={pending}
                  type="submit"
                  className="w-full rounded-[1.25rem] bg-slate-950 py-3 text-base text-white hover:bg-slate-900"
                >
                  Sign in
                </Button>

                <div className="relative text-center text-sm text-muted-foreground">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                  <span className="relative inline-flex bg-white px-3">Or continue with</span>
                </div>

                <Button
                  disabled={pending}
                  onClick={() => {
                    authClient.signIn.social({
                      provider: "github",
                    });
                  }}
                  variant="outline"
                  type="button"
                  className="w-full justify-center gap-2 border-slate-200 text-slate-700"
                >
                  <GitBranch className="h-4 w-4" />
                  Continue with GitHub
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account? {" "}
                  <Link href="/sign-up" className="text-primary underline-offset-4 hover:underline">
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};
