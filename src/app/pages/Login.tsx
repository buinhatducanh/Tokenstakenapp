import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Fingerprint, Hexagon, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const navigate = useNavigate();

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call to send magic link
    setTimeout(() => {
      setIsLoading(false);
      setIsMagicLinkSent(true);
      toast.success("Magic link sent to your email!");
    }, 1500);
  };

  const handleWebAuthn = () => {
    // Simulate Passkey/WebAuthn prompt
    toast.info("Prompting for Passkey...", { duration: 2000 });
    
    setTimeout(() => {
      toast.success("Authentication successful!");
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-xl bg-indigo-600 p-2.5 shadow-sm">
            <Hexagon className="h-8 w-8 text-white fill-white/20" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-neutral-900">
          Sign in to Tokens_taken
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Secure, passwordless B2B financial management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl border border-neutral-200 sm:px-10">
          {!isMagicLinkSent ? (
            <>
              <form className="space-y-6" onSubmit={handleMagicLink}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                    Email address
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md border-0 py-2.5 pl-10 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center items-center rounded-md bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Send Magic Link <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-neutral-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleWebAuthn}
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus-visible:ring-transparent transition-colors"
                  >
                    <Fingerprint className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-semibold leading-6">Passkey / Biometrics</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Check your inbox</h3>
              <p className="text-sm text-neutral-500 mb-6">
                We've sent a temporary login link to <span className="font-medium text-neutral-900">{email}</span>.
              </p>
              
              <button
                onClick={() => {
                  toast.success("Login simulated!");
                  navigate("/");
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                (Simulate clicking the link)
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-xs text-neutral-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
