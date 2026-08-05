// src/pages/Auth.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client'; // <-- static import (fix)

// Authentication page component
const Auth = () => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Password reset states
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');

  // Signup OTP states
  const [signupStep, setSignupStep] = useState<'form' | 'verify'>('form');
  const [signupOtp, setSignupOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const OTP_VALIDITY_SECONDS = 180; // must match "Email OTP Expiration" in Supabase Auth settings
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(OTP_VALIDITY_SECONDS);

  // Hooks
  const { signIn, signUp, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if this is admin login
  const isAdminMode = searchParams.get('admin') === 'true';

  useEffect(() => {
    // Never redirect away while the user is mid-way through entering their
    // signup OTP — even if a session briefly exists, they still need to see
    // the verify screen instead of getting bounced to the dashboard.
    if (activeTab === 'signup' && signupStep === 'verify') {
      return;
    }

    if (!loading && isAuthenticated) {
      console.log('🔄 User authenticated, redirecting...', { isAdmin, isAdminMode });

      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else if (isAdminMode) {
        setError('You do not have admin privileges');
        return;
      } else {
        navigate('/customer-dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, loading, navigate, isAdminMode, activeTab, signupStep]);

  // Simple resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // OTP validity countdown — the code is only good for OTP_VALIDITY_SECONDS
  // (matches the "Email OTP Expiration" setting in Supabase Auth). Once it
  // hits 0 we stop letting the user submit and point them at Resend instead.
  useEffect(() => {
    if (signupStep !== 'verify' || otpSecondsLeft <= 0) return;
    const t = setTimeout(() => setOtpSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [signupStep, otpSecondsLeft]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setConfirmPassword('');
    setError('');
    setResetCode('');
    setNewPassword('');
    setResetStep('request');
    setSignupStep('form');
    setSignupOtp('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setActionLoading(false);
      return;
    }

    try {
      console.log('🔑 Submitting login form for:', email);
      const { error } = await signIn(email, password);

      if (error) {
        console.error('❌ Login failed:', error);
        setError(error.message || 'Login failed');
        setActionLoading(false);
        return;
      }

      console.log('✅ Login successful, showing success message');
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      // Redirect handled by useEffect when auth state updates
    } catch (error: any) {
      console.error('💥 Login exception:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  // Step 1 of signup: create the account, Supabase sends a 6-digit OTP to the email
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    if (!email || !password || !confirmPassword || !fullName || !phone) {
      setError('Please fill in all fields');
      setActionLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setActionLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setActionLoading(false);
      return;
    }

    try {
      console.log('📝 Submitting signup form for:', email);
      const { error, otpSent, autoConfirmed } = await signUp(email, password, fullName, phone);

      if (error) {
        console.error('❌ Signup failed:', error);
        setError(error.message || 'Signup failed');
        setActionLoading(false);
        return;
      }

      if (autoConfirmed) {
        // Supabase logged the user in immediately — "Confirm email" is off,
        // so no OTP was ever sent. Log it loudly here too, in case the
        // AuthContext console warning gets missed.
        console.warn('⚠️ No OTP was sent — signup auto-confirmed the session. Enable "Confirm email" in Supabase Auth settings to require OTP verification.');
        toast({
          title: "Account created",
          description: "Signed up successfully (note: email OTP is currently disabled in Supabase settings).",
        });
        setActionLoading(false);
        return;
      }

      console.log(otpSent ? '✅ Signup submitted, OTP email confirmed queued' : '⚠️ Signup submitted, but no confirmation email was detected — check Supabase Auth Logs / SMTP settings');
      toast({
        title: "Check your email",
        description: otpSent
          ? "We sent a 6-digit verification code to your email."
          : "Signup succeeded, but we couldn't confirm the OTP email was sent — check your inbox and spam folder.",
      });

      setSignupStep('verify');
      setResendCooldown(30);
      setOtpSecondsLeft(OTP_VALIDITY_SECONDS);
      setActionLoading(false);
    } catch (error: any) {
      console.error('💥 Signup exception:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  // Step 2 of signup: verify the OTP code the user received by email
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    if (!signupOtp || signupOtp.length !== 6) {
      setError('Please enter the 6-digit code');
      setActionLoading(false);
      return;
    }

    if (otpSecondsLeft <= 0) {
      setError('This code has expired. Please request a new one.');
      setActionLoading(false);
      return;
    }

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: signupOtp.trim(),
        type: 'signup',
      });

      if (verifyError) {
        console.error('❌ OTP verification failed:', verifyError);
        setError(verifyError.message || 'Invalid or expired code');
        setActionLoading(false);
        return;
      }

      console.log('✅ Signup OTP verified', data?.user?.id);
      toast({
        title: "Account verified",
        description: "Your account is ready. Welcome!",
      });

      // supabase.auth.verifyOtp establishes a session automatically,
      // so the useEffect above will pick up isAuthenticated and redirect.
      setActionLoading(false);
    } catch (error: any) {
      console.error('💥 OTP verification exception:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    if (resendCooldown > 0) return;
    setActionLoading(true);
    setError('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (resendError) {
        setError(resendError.message || 'Failed to resend code');
        setActionLoading(false);
        return;
      }

      toast({
        title: "Code resent",
        description: "Check your email for the new code.",
      });
      setResendCooldown(30);
      setOtpSecondsLeft(OTP_VALIDITY_SECONDS);
      setActionLoading(false);
    } catch (error: any) {
      console.error('💥 Resend OTP exception:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  // Google OAuth — Supabase handles the redirect and creates the auth.users row;
  // a DB trigger (see notes) mirrors that into your own users/profiles table.
  const handleGoogleAuth = async () => {
    setActionLoading(true);
    setError('');

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        console.error('❌ Google sign-in failed:', oauthError);
        setError(oauthError.message || 'Google sign-in failed');
        setActionLoading(false);
      }
      // On success the browser redirects to Google, so no further state change here.
    } catch (error: any) {
      console.error('💥 Google sign-in exception:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    if (!email || !phone) {
      setError('Please enter both email and phone number');
      setActionLoading(false);
      return;
    }

    try {
      // Use existing static supabase import
      const { data, error: rpcError } = await supabase
        .rpc('request_password_reset', {
          user_email: email.trim(),
          user_phone: phone.trim()
        });

      if (rpcError) {
        console.error('Reset request RPC error:', rpcError);
        setError('Failed to process reset request');
        setActionLoading(false);
        return;
      }

      const result = data?.[0];

      if (!result?.success) {
        setError(result?.error_message || 'Email and phone number do not match our records');
        setActionLoading(false);
        return;
      }

      toast({
        title: "Reset code generated",
        description: `Your reset code is: ${result.reset_code}. It expires in 15 minutes.`,
        duration: 10000,
      });

      setResetStep('verify');
      setActionLoading(false);
    } catch (error: any) {
      console.error('Reset request error:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    if (!resetCode || !newPassword) {
      setError('Please enter reset code and new password');
      setActionLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setActionLoading(false);
      return;
    }

    try {
      // Use existing static supabase import
      const { data, error: functionError } = await supabase.functions.invoke('reset-password', {
        body: {
          email: email.trim(),
          phone: phone.trim(),
          code: resetCode.trim(),
          newPassword: newPassword
        }
      });

      if (functionError) {
        console.error('Reset password function error:', functionError);
        setError('Failed to reset password. Please try again.');
        setActionLoading(false);
        return;
      }

      if (data?.error) {
        setError(data.error);
        setActionLoading(false);
        return;
      }

      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });

      resetForm();
      setActiveTab('login');
      setActionLoading(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('An unexpected error occurred');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!loading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {isAdminMode ? <Shield className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-white" />}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isAdminMode ? 'Admin Portal' : 'Welcome'}
          </CardTitle>
          <CardDescription>
            {isAdminMode ? 'Sign in to access the admin dashboard' : 'Sign in to your account or create a new one'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdminMode && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4 flex items-center justify-center gap-2"
                onClick={handleGoogleAuth}
                disabled={actionLoading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.41 3.58v2.98h3.91c2.29-2.11 3.52-5.22 3.52-8.8z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.91-2.98c-1.08.72-2.46 1.15-4.02 1.15-3.1 0-5.72-2.09-6.66-4.9H1.29v3.07C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.34 14.35A7.19 7.19 0 0 1 5 12c0-.82.14-1.61.34-2.35V6.58H1.29A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.29 5.42l4.05-3.07z" />
                  <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l4.05 3.07C6.28 6.85 8.9 4.77 12 4.77z" />
                </svg>
                Continue with Google
              </Button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    disabled={actionLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    disabled={actionLoading}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={actionLoading}>
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {actionLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signupStep === 'form' ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Enter your phone number"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a password"
                      disabled={actionLoading}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      disabled={actionLoading}
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={actionLoading}>
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {actionLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifySignupOtp} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    We sent a 6-digit code to <span className="font-medium">{email}</span>.
                    Enter it below to verify your account.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">Verification Code</Label>
                    <Input
                      id="signup-otp"
                      type="text"
                      inputMode="numeric"
                      value={signupOtp}
                      onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      placeholder="Enter 6-digit code"
                      disabled={actionLoading || otpSecondsLeft <= 0}
                      maxLength={6}
                    />
                    <p className={`text-xs ${otpSecondsLeft <= 30 ? 'text-red-600' : 'text-gray-500'}`}>
                      {otpSecondsLeft > 0
                        ? `Code expires in ${Math.floor(otpSecondsLeft / 60)}:${String(otpSecondsLeft % 60).padStart(2, '0')}`
                        : 'Code expired — request a new one below.'}
                    </p>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Button type="submit" className="w-full" disabled={actionLoading || otpSecondsLeft <= 0}>
                      {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {actionLoading ? 'Verifying...' : 'Verify & Continue'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleResendSignupOtp}
                      disabled={actionLoading || resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={() => {
                        setSignupStep('form');
                        setSignupOtp('');
                        setError('');
                      }}
                      disabled={actionLoading}
                    >
                      ← Back to sign up form
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="reset">
              {resetStep === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-phone">Phone Number</Label>
                    <Input
                      id="reset-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Enter your phone number"
                      disabled={actionLoading}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={actionLoading}>
                    {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {actionLoading ? 'Generating Code...' : 'Get Reset Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-code">Reset Code</Label>
                    <Input
                      id="reset-code"
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                      placeholder="Enter 6-digit code"
                      disabled={actionLoading}
                      maxLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      disabled={actionLoading}
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Button type="submit" className="w-full" disabled={actionLoading}>
                      {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {actionLoading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setResetStep('request')}
                      disabled={actionLoading}
                    >
                      Back to Request Code
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center space-y-2">
            {!isAdminMode && (
              <Button
                variant="link"
                onClick={() => navigate('/auth?admin=true')}
                className="text-sm text-gray-600"
              >
                Admin Login →
              </Button>
            )}
            <div>
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm text-gray-600"
              >
                ← Back to main site
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;