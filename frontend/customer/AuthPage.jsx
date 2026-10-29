/**
 * @BACKEND_TEAM - AUTHENTICATION INTEGRATION:
 * 
 * 1. Login Submission: 
 *    - Wire up the form to send `POST /api/auth/login` with `{ email, password }`.
 *    - On success, store the JWT (e.g., in an httpOnly cookie or Zustand store) and fetch the user profile.
 * 2. Signup Submission:
 *    - Wire up the form to send `POST /api/auth/register` with `{ fullName, username, email, countryCode, mobile, gender, dob, password }`.
 * 3. Form Validation:
 *    - Add client-side validation for passwords and backend error handling (e.g., "Email already exists", "Invalid credentials").
 *    - Use a global Auth store (e.g., `useAuthStore`) to track `isAuthenticated` state across the app.
 */
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/store/useAuthStore';
import toast from 'react-hot-toast';
import { ChevronDown, Eye, EyeOff, Mail, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import { useRef } from 'react';
import { COUNTRIES } from '../data/countries';

function TermsAccordion() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border mt-4">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-4 flex justify-between items-center bg-muted/30 text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-colors"
      >
        Read Terms & Conditions Summary
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 text-xs text-muted-foreground leading-relaxed max-h-48 overflow-y-auto bg-background border-t border-border space-y-2.5">
          <p className="font-bold text-foreground">H&S (Owned by ASaT — As Simple as That)</p>
          <p><strong className="text-foreground">1. Order Fulfilment:</strong> All products are designed, manufactured, quality inspected, and fulfilled by H&S and authorized partners.</p>
          <p><strong className="text-foreground">2. Cancellation Policy:</strong> Cancellation within 36 hours incurs a 50% cancellation fee. After 36 hours, orders are confirmed with a 100% cancellation fee.</p>
          <p><strong className="text-foreground">3. Returns & Exchanges:</strong> No returns or exchanges for wrong size/color selection or preference. Exchanges are accepted only for verified defects or transit damage supported by an uninterrupted unboxing video.</p>
          <p><strong className="text-foreground">4. Privacy & IP:</strong> Customer data is protected and never sold. All designs, artwork, graphics, and prints are exclusive intellectual property of H&S and ASaT.</p>
          <Link to="/terms" target="_blank" className="text-foreground font-bold underline uppercase tracking-wider text-[11px] block pt-2 hover:text-black">
            View Full Terms & Conditions &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

function CountrySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = COUNTRIES.find(c => c.name === value) || COUNTRIES.find(c => c.name === 'India') || COUNTRIES[0];

  return (
    <div className="relative w-full" ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-4 py-4 border border-border bg-background flex items-center justify-between focus:outline-none focus:border-foreground"
      >
        <div className="flex items-center gap-3">
          <img src={selected.flag} alt={selected.iso} className="w-5 h-auto shadow-sm" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">{selected.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-border shadow-lg z-50 max-h-60 overflow-y-auto">
          {COUNTRIES.map(c => (
            <button
              key={c.iso}
              type="button"
              onClick={() => { onChange(c.name); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-sm"
            >
              <img src={c.flag} alt={c.iso} className="w-5 h-auto shadow-sm" />
              <span className="font-medium uppercase tracking-widest text-muted-foreground text-xs">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// OTP Input Component
function OtpInput({ value, onChange, length = 6 }) {
  const inputs = useRef([]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const newOtp = value.split('');
      newOtp[index] = '';
      onChange(newOtp.join(''));
      return;
    }
    // Handle paste
    if (val.length > 1) {
      const pasted = val.slice(0, length);
      onChange(pasted.padEnd(length, '').slice(0, length));
      inputs.current[Math.min(pasted.length - 1, length - 1)]?.focus();
      return;
    }
    const newOtp = value.padEnd(length, '').split('');
    newOtp[index] = val[0];
    onChange(newOtp.join(''));
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
        />
      ))}
    </div>
  );
}

// Forgot password stages: 'email' -> 'otp' -> 'reset'
const FORGOT_STAGE = { EMAIL: 'email', OTP: 'otp', RESET: 'reset' };

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [country, setCountry] = useState('India');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(
    location.pathname === '/forgot-password'
  );
  const [forgotStage, setForgotStage] = useState(FORGOT_STAGE.EMAIL);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const selectedCountryObj = COUNTRIES.find(c => c.name === country) || COUNTRIES.find(c => c.name === 'India');
  const countryCode = selectedCountryObj?.code || '+91';

  const calculatedAge = dob ? Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970) : '';

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setIsForgotPassword(location.pathname === '/forgot-password');
  }, [location]);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const login = useAuthStore(state => state.login);
  const signup = useAuthStore(state => state.signup);
  const isLoggingIn = useAuthStore(state => state.isLoggingIn);
  const isSigningUp = useAuthStore(state => state.isSigningUp);

  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

  // Step 1: Send OTP to email
  const handleSendOtp = async (isResend = false) => {
    const email = forgotEmail.trim().toLowerCase();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${apiBase}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to send OTP');
      }

      toast.success(isResend ? 'OTP resent successfully!' : 'OTP sent to your email!');
      setOtpValue('');
      setForgotStage(FORGOT_STAGE.OTP);
      setResendCooldown(60);
    } catch (error) {
      toast.error(error.message || 'Unable to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (otpValue.replace(/\D/g, '').length < 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${apiBase}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase(), otp: otpValue.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP');
      }

      // Backend should return a short-lived reset token
      setResetToken(data.resetToken || data.token || otpValue);
      toast.success('OTP verified! Set your new password.');
      setForgotStage(FORGOT_STAGE.RESET);
    } catch (error) {
      toast.error(error.message || 'Invalid or expired OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 3: Reset password with token
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(`${apiBase}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset password');
      }

      toast.success('Password reset successfully! Please sign in.');
      // Reset everything
      setIsForgotPassword(false);
      setForgotStage(FORGOT_STAGE.EMAIL);
      setForgotEmail('');
      setOtpValue('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Unable to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setForgotStage(FORGOT_STAGE.EMAIL);
    setForgotEmail('');
    setOtpValue('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      if (isLogin) {
        await login({ email: data.email, password: data.password });
        // Redirect to original destination if set
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        if (data.password !== data.confirmPassword) {
          return toast.error('Passwords do not match');
        }
        await signup({
          fullName: data.fullName,
          email: data.email,
          country,
          countryCode,
          mobile: data.mobile,
          gender: data.gender,
          dob: data.dob,
          password: data.password
        });
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ─── Forgot Password UI ─────────────────────────────────────────────────────
  const renderForgotPassword = () => (
    <div className="space-y-6">
      {/* Stage indicator */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3].map((step) => {
          const stageIndex = { [FORGOT_STAGE.EMAIL]: 1, [FORGOT_STAGE.OTP]: 2, [FORGOT_STAGE.RESET]: 3 }[forgotStage];
          return (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${step <= stageIndex ? 'bg-black text-white border-black' : 'bg-white text-muted-foreground border-border'}`}>
                {step}
              </div>
              {step < 3 && <div className={`w-8 h-0.5 transition-all ${step < stageIndex ? 'bg-black' : 'bg-border'}`} />}
            </div>
          );
        })}
      </div>

      {/* Stage: Email */}
      {forgotStage === FORGOT_STAGE.EMAIL && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-1">Forgot Password?</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Enter your email to receive a 6-digit OTP</p>
          </div>
          <input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            placeholder="Email Address"
            className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground"
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleSendOtp(false)}
            disabled={isSending}
            className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSending ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
            ) : 'Send OTP'}
          </button>
          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Sign In
          </button>
        </div>
      )}

      {/* Stage: OTP Verification */}
      {forgotStage === FORGOT_STAGE.OTP && (
        <div className="space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-1">Enter OTP</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
              We sent a 6-digit code to<br />
              <span className="text-foreground font-bold">{forgotEmail}</span>
            </p>
          </div>

          <OtpInput value={otpValue} onChange={setOtpValue} length={6} />

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isVerifying || otpValue.replace(/\D/g, '').length < 6}
            className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
            ) : 'Verify OTP'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">Didn't receive the code?</p>
            <button
              type="button"
              onClick={() => handleSendOtp(true)}
              disabled={resendCooldown > 0 || isSending}
              className="flex items-center justify-center gap-1 mx-auto text-xs font-bold uppercase tracking-widest text-foreground underline underline-offset-4 disabled:opacity-40 disabled:no-underline transition-opacity"
            >
              <RefreshCw className="w-3 h-3" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setForgotStage(FORGOT_STAGE.EMAIL)}
            className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Change Email
          </button>
        </div>
      )}

      {/* Stage: Reset Password */}
      {forgotStage === FORGOT_STAGE.RESET && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-1">New Password</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Set a strong new password for your account</p>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min. 6 characters)"
              className="w-full p-4 pr-12 border border-border bg-background focus:outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmNewPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full p-4 pr-12 border border-border bg-background focus:outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {newPassword && (
            <div className="flex gap-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
                  newPassword.length >= i * 3 
                    ? newPassword.length >= 10 ? 'bg-green-500' : newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-red-400'
                    : 'bg-border'
                }`} />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isResetting}
            className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isResetting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
            ) : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full flex bg-background pt-16 lg:pt-0">
      {/* Left side: Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-[100dvh] items-center justify-center bg-[#f7f7f7] border-r border-border p-8 xl:p-16 select-none overflow-hidden">
        <img 
          src="/auth-side-logo.jpeg" 
          alt="H&S Black Neck Logo" 
          onError={(e) => { e.currentTarget.src = '/Black Neck Logo.png'; }}
          className="w-full max-w-xl xl:max-w-2xl max-h-[85dvh] object-contain select-none" 
        />
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16 lg:py-24 min-h-[calc(100dvh-4rem)] lg:min-h-[100dvh]">
        <div className="max-w-md w-full">

          {/* ── Forgot Password Flow ─────────────────────── */}
          {isForgotPassword ? (
            renderForgotPassword()
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="font-heading text-4xl font-bold uppercase tracking-tight mb-4">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-muted-foreground uppercase text-xs tracking-widest">
                  {isLogin 
                    ? 'Sign in to access your wishlist, orders, and exclusive drops.' 
                    : 'Join the collective for early access and faster checkout.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {isLogin ? (
                  <>
                    <input required type="email" name="email" placeholder="Email Address" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} name="password" placeholder="Password" className="w-full p-4 pr-12 border border-border bg-background focus:outline-none focus:border-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <input required type="text" name="fullName" placeholder="Full Name" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                    <input required type="email" name="email" placeholder="Email Address (Gmail preferred)" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                    
                    <CountrySelect value={country} onChange={setCountry} />
                    
                    <div className="flex gap-4">
                      <input type="text" value={countryCode} readOnly className="w-24 p-4 border border-border bg-muted/50 text-muted-foreground focus:outline-none cursor-not-allowed text-center font-medium" />
                      <input required type="tel" name="mobile" placeholder="Mobile Number" className="flex-1 p-4 border border-border bg-background focus:outline-none focus:border-foreground" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2 ml-1">Gender</label>
                        <select name="gender" className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground" required defaultValue="">
                          <option value="" disabled>Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2 ml-1">Date of Birth</label>
                        <input 
                          required 
                          type="date" 
                          name="dob"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full p-4 border border-border bg-background focus:outline-none focus:border-foreground uppercase text-xs tracking-widest text-muted-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-2 ml-1">Age</label>
                        <input 
                          type="text" 
                          value={calculatedAge ? `${calculatedAge} YRS` : ''} 
                          readOnly 
                          placeholder="AUTO"
                          className="w-full p-4 border border-border bg-muted/50 text-muted-foreground focus:outline-none cursor-not-allowed uppercase text-xs tracking-widest font-medium" 
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} name="password" placeholder="Password" className="w-full p-4 pr-12 border border-border bg-background focus:outline-none focus:border-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="relative">
                      <input required type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="w-full p-4 pr-12 border border-border bg-background focus:outline-none focus:border-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <TermsAccordion />
                    <label className="flex items-start gap-3 mt-4 cursor-pointer">
                      <input required type="checkbox" className="w-5 h-5 accent-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs uppercase tracking-widest text-muted-foreground leading-relaxed">
                        I accept the <Link to="/terms" target="_blank" className="text-foreground underline font-bold hover:text-black">Terms & Conditions</Link> & <Link to="/terms#privacy" target="_blank" className="text-foreground underline font-bold hover:text-black">Privacy Policy</Link> and confirm I am over 18 years old.
                      </span>
                    </label>
                  </>
                )}

                <button disabled={isLoggingIn || isSigningUp} type="submit" className="w-full py-4 mt-6 bg-foreground text-background font-bold uppercase tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50">
                  {isLoggingIn || isSigningUp ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </button>
              </form>

              <div className="mt-8 text-center">
                {isLogin ? (
                  <>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setForgotStage(FORGOT_STAGE.EMAIL); }}
                        className="hover:text-foreground transition-colors underline underline-offset-4"
                      >
                        Forgot your password?
                      </button>
                    </p>
                    <p className="text-sm uppercase tracking-wide">
                      Don't have an account?{' '}
                      <Link to="/signup" className="font-bold border-b border-black pb-1 hover:text-muted-foreground transition-colors">Create one</Link>
                    </p>
                  </>
                ) : (
                  <p className="text-sm uppercase tracking-wide">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold border-b border-black pb-1 hover:text-muted-foreground transition-colors">Sign in</Link>
                  </p>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
