"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  instructions: z.string().min(1, "Agent instructions are required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewAgentPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      instructions: "",
    },
  });

  const createAgent = useMutation(
    trpc.agents.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.agents.getMany.queryKey() });
        router.push("/agents");
      },
    }),
  );

  const onSubmit = (values: FormValues) => {
    createAgent.mutate(values);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card className="rounded-[1.5rem] border-border bg-card shadow-sm">
        <CardHeader className="space-y-3 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              New agent
            </p>
            <CardTitle className="mt-2 text-3xl font-semibold text-foreground">
              Create a new AI assistant
            </CardTitle>
          </div>
          <CardDescription>
            Add a name and describe how the agent should behave. You can refine its instructions later.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Research Assistant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the agent's role, tone, and any special behavior."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  A descriptive prompt helps the agent stay consistent and useful.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/agents" className="inline-block">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={createAgent.isPending}>
                    {createAgent.isPending ? "Creating…" : "Create agent"}
                  </Button>
                </div>
              </div>

              {createAgent.error ? (
                <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {createAgent.error.message}
                </div>
              ) : null}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
