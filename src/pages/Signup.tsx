import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel';

const getPasswordStrength = (pw: string) => {
  const checks = [
    { label: '8+ characters', passed: pw.length >= 8 },
    { label: 'Uppercase letter', passed: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter', passed: /[a-z]/.test(pw) },
    { label: 'Number', passed: /\d/.test(pw) },
    { label: 'Special character', passed: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.passed).length;
  const level = score <= 1 ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong';
  const color =
    score <= 1
      ? 'bg-destructive'
      : score <= 3
        ? 'bg-yellow-500'
        : score === 4
          ? 'bg-blue-500'
          : 'bg-green-500';
  return { checks, score, level, color };
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Sign up functionality requires backend integration.');
    }, 1000);
  };

  const handleGoogleSignup = () => {
    toast.info('Google OAuth requires backend integration.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AuthBrandingPanel
        headline="Start building today."
        description="Create your free account and join thousands of teams shipping better software with AM PM."
      />

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold tracking-tight">A</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">AM PM</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-8">Get started for free — no credit card required</p>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full h-11 gap-3 text-sm font-medium"
            onClick={handleGoogleSignup}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-6">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Sign up form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-foreground">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              <AnimatePresence>
                {password.length > 0 && (() => {
                  const strength = getPasswordStrength(password);
                  return (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 pt-1"
                    >
                      {/* Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                i <= strength.score ? strength.color : 'bg-muted'
                              }`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.2, delay: i * 0.05 }}
                              style={{ transformOrigin: 'left' }}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-medium min-w-[40px] text-right ${
                          strength.score <= 1 ? 'text-destructive' : strength.score <= 3 ? 'text-yellow-600 dark:text-yellow-400' : strength.score === 4 ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {strength.level}
                        </span>
                      </div>
                      {/* Checklist */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {strength.checks.map((check) => (
                          <div key={check.label} className="flex items-center gap-1.5">
                            {check.passed ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <X className="w-3 h-3 text-muted-foreground/50" />
                            )}
                            <span className={`text-[11px] ${check.passed ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                              {check.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed font-normal cursor-pointer">
                I agree to the{' '}
                <span className="text-primary hover:text-primary/80 transition-colors">Terms of Service</span>{' '}
                and{' '}
                <span className="text-primary hover:text-primary/80 transition-colors">Privacy Policy</span>
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
