import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/authApi";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.verifyAccount(token);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    if (token) verify();
    else setStatus("error");
  }, [token]);

  return (
    <div className="h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-6 text-center space-y-4">

          {/* LOADING */}
          {status === "loading" && (
            <>
              <h2 className="text-xl font-semibold">Verifying your account...</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your email.
              </p>
            </>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <>
              <h2 className="text-xl font-semibold text-green-600">
                ✅ Email Verified
              </h2>

              <p className="text-muted-foreground">
                Your account has been successfully verified. You can now log in.
              </p>

              <Button
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </>
          )}

          {/* ERROR */}
          {status === "error" && (
            <>
              <h2 className="text-xl font-semibold text-red-600">
                ❌ Verification Failed
              </h2>

              <p className="text-muted-foreground">
                This link is invalid or has expired.
              </p>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/resend-verification")}
              >
                Resend Verification Email
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}