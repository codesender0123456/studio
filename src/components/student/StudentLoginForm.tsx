
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type StudentLoginFormProps = {
  error: string | null;
};

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
  </svg>
);


export default function StudentLoginForm({ error }: StudentLoginFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Let the main page component handle the redirect and data fetching
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Authentication Error",
        description:
          error.code === "auth/account-exists-with-different-credential"
            ? "An account already exists with the same email address but different sign-in credentials. Please sign in using a provider associated with this email address."
            : error.message || "An error occurred during sign-in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto holographic-card glowing-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Student Portal</CardTitle>
        <CardDescription className="text-center">
            Sign in with your Google account to view your details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-md text-sm text-center">
            <p>{error}</p>
          </div>
        )}
        <Button onClick={handleGoogleSignIn} className="w-full glowing-shadow" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            <>
              <GoogleIcon className="mr-2 h-6 w-6" />
              Sign in with Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
