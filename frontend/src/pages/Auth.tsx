import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              CodeCompiler
            </span>
          </Link>
          <p className="text-muted-foreground">
            {isSignUp ? "Create your account to save and manage code" : "Welcome back! Sign in to continue"}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader className="space-y-4">
            <CardTitle className="text-center text-xl">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            
            {/* Toggle Buttons */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                variant={!isSignUp ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSignUp(false)}
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                variant={isSignUp ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsSignUp(true)}
                className="flex-1"
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex justify-center pb-8">
            {isSignUp ? (
              <SignUp 
                fallbackRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              
              />
            ) : (
              <SignIn 
                fallbackRedirectUrl="/"
                forceRedirectUrl="/"
              />
            )}
          </CardContent>
        </Card>

        {/* Back to Compiler */}
        <div className="text-center">
          <Link to="/">
            <Button variant="ghost" size="sm">
              ← Back to Compiler
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}