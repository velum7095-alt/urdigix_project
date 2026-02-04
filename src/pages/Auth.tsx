/**
 * Admin Authentication Page
 * ==========================
 * Secure login page with:
 * - Rate limiting protection
 * - Input validation with Zod
 * - Progressive lockout on failed attempts
 * - No sensitive data logging
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/useRateLimiter';
import { Lock, Mail, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

// Strict validation schema
const authSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" })
    .max(255, { message: "Email too long" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .max(100, { message: "Password too long" }),
});

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rate limiting for login attempts
  const { 
    isLocked, 
    remainingLockoutMs, 
    recordAttempt,
    attempts 
  } = useRateLimiter({
    maxAttempts: 5,
    storageKey: 'admin_login_rate_limit',
  });

  // Format remaining lockout time
  const formatLockoutTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/admin');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check rate limiting first
    if (isLocked) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${formatLockoutTime(remainingLockoutMs)} before trying again.`,
        variant: "destructive",
      });
      return;
    }

    // Validate input
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Record failed attempt (don't log sensitive details)
        recordAttempt(false);
        
        // Generic error message to prevent enumeration
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        // Record successful attempt (resets counter)
        recordAttempt(true);
        
        toast({
          title: "Welcome!",
          description: "Successfully logged in.",
        });
      }
    } catch {
      // Record failed attempt
      recordAttempt(false);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Admin Login
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to access the admin panel
            </p>
          </div>

          {/* Rate Limit Warning */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">
                  Too many failed attempts
                </p>
                <p className="text-sm text-red-600">
                  Please wait {formatLockoutTime(remainingLockoutMs)} before trying again.
                </p>
              </div>
            </motion.div>
          )}

          {/* Attempt Warning */}
          {!isLocked && attempts > 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <p className="text-sm text-amber-700 text-center">
                {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining before temporary lockout
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@urdigix.com"
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  required
                  disabled={isLocked}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  required
                  disabled={isLocked}
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all"
              disabled={isSubmitting || isLocked}
            >
              {isSubmitting ? 'Verifying...' : isLocked ? 'Locked' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Protected admin area • URDIGIX
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
