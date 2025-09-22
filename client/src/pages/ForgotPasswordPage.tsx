import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordSchema } from "@shared/schema";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { z } from "zod";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Password reset request failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reset link sent!",
        description: "If the email exists in our system, you'll receive a password reset link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ForgotPasswordFormData) {
    forgotPasswordMutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-forgot-password">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle data-testid="text-forgot-password-title">Forgot Password</CardTitle>
            <CardDescription>
              We'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotPasswordMutation.isSuccess ? (
              <div className="space-y-4">
                <Alert data-testid="alert-reset-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Reset link sent!</strong><br />
                    If an account with that email exists, you'll receive a password reset link shortly. 
                    Check your inbox and spam folder.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full"
                    data-testid="button-back-to-login"
                  >
                    Back to Sign In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      forgotPasswordMutation.reset();
                      form.reset();
                    }}
                    className="w-full"
                    data-testid="button-send-another"
                  >
                    Send Another Link
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email address"
                            data-testid="input-email"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {forgotPasswordMutation.isError && (
                    <Alert variant="destructive" data-testid="alert-forgot-password-error">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {forgotPasswordMutation.error?.message || "Failed to send reset link. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotPasswordMutation.isPending}
                      data-testid="button-send-reset-link"
                    >
                      {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate("/login")}
                      data-testid="button-back-to-login-form"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}