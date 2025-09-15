import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, User } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { supabase } from '../../lib/supabase';
import { validateAuthCredentials, sanitizeUserInput } from '../../lib/validation';
import { validatePasswordStrength } from '../../lib/security';
import { createUserProfile } from '../../lib/profile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
  const { addToast } = useToast();

  // Password strength validation
  useEffect(() => {
    if (mode === 'signup' && password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    }
  }, [password, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError('');

    // Validate input
    const validation = validateAuthCredentials({
      email: sanitizeUserInput(email),
      password,
      confirmPassword: mode === 'signup' ? confirmPassword : undefined
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: sanitizeUserInput(email),
          password,
          options: {
            data: {
              full_name: sanitizeUserInput(fullName, 100),
            },
          },
        });
        if (error) throw error;
        
        // Create user profile after successful signup
        if (data.user) {
          try {
            await createUserProfile(data.user.id, {
              email: data.user.email!,
              display_name: sanitizeUserInput(fullName || data.user.email!.split('@')[0], 100),
            });
          } catch (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizeUserInput(email),
          password,
        });
        if (error) throw error;
      }
      onClose();
      // Redirect to dashboard after successful login/signup
      navigate('/dashboard');
      
      addToast({
        type: 'success',
        message: mode === 'signup' ? 'Account created successfully!' : 'Welcome back!'
      });
    } catch (error: any) {
      setError(error.message);
      addToast({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={validationErrors.displayName}
              required
            />
          )}
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={validationErrors.email}
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={validationErrors.password}
            required
          />

          {mode === 'signup' && password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Password strength:</span>
                <span className={`font-medium ${
                  passwordStrength.score < 50 ? 'text-red-600' : 
                  passwordStrength.score < 75 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {passwordStrength.score < 50 ? 'Weak' : 
                   passwordStrength.score < 75 ? 'Good' : 'Strong'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.score < 50 ? 'bg-red-500' : 
                    passwordStrength.score < 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${passwordStrength.score}%` }}
                ></div>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={validationErrors.confirmPassword}
              required
            />
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};