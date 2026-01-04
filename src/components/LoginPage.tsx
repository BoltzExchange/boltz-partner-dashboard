import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Zap, AlertCircle, Loader2, Key, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedKey = apiKey.trim();
    const trimmedSecret = apiSecret.trim();

    if (!trimmedKey || !trimmedSecret) {
      setError('Please enter both API Key and API Secret');
      setIsLoading(false);
      return;
    }

    const success = await login(trimmedKey, trimmedSecret);
    
    if (!success) {
      setError('Invalid credentials. Please check your API Key and Secret.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-volt-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-volt-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo and title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-volt-500/10 border border-volt-500/20 mb-6">
            <Zap className="w-8 h-8 text-volt-400" />
          </div>
          <h1 className="text-3xl font-semibold text-night-100 mb-2">
            Partner Dashboard
          </h1>
          <p className="text-night-400">
            Sign in with your Boltz API credentials
          </p>
        </div>

        {/* Login form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-night-900/80 backdrop-blur-sm border border-night-800 rounded-2xl p-8 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="space-y-5">
            <div>
              <label 
                htmlFor="apiKey" 
                className="flex items-center gap-2 text-sm font-medium text-night-300 mb-2"
              >
                <Key className="w-4 h-4" />
                API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API Key"
                className="w-full px-4 py-3 bg-night-950 border border-night-700 rounded-xl 
                         text-night-100 placeholder-night-500
                         focus:outline-none focus:ring-2 focus:ring-volt-500/50 focus:border-volt-500
                         transition-all duration-200 font-mono text-sm"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <div>
              <label 
                htmlFor="apiSecret" 
                className="flex items-center gap-2 text-sm font-medium text-night-300 mb-2"
              >
                <Lock className="w-4 h-4" />
                API Secret
              </label>
              <input
                type="password"
                id="apiSecret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your API Secret"
                className="w-full px-4 py-3 bg-night-950 border border-night-700 rounded-xl 
                         text-night-100 placeholder-night-500
                         focus:outline-none focus:ring-2 focus:ring-volt-500/50 focus:border-volt-500
                         transition-all duration-200 font-mono text-sm"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-volt-500 hover:bg-volt-400 disabled:bg-volt-600 
                       text-night-950 font-semibold rounded-xl
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-volt-400 focus:ring-offset-2 focus:ring-offset-night-900
                       flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-night-800">
            <p className="text-night-500 text-sm text-center">
              Don't have API credentials?{' '}
              <a 
                href="https://boltz.exchange" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-volt-400 hover:text-volt-300 transition-colors"
              >
                Become a partner
              </a>
            </p>
          </div>
        </form>

        {/* Security note */}
        <div className="mt-6 p-4 bg-night-900/40 rounded-xl border border-night-800 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-night-500 text-xs text-center">
            🔒 Your credentials are stored locally and used for HMAC authentication.
            <br />
            All requests are signed and sent directly to Boltz Exchange API.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-night-600 text-sm mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Powered by Boltz Exchange
        </p>
      </div>
    </div>
  );
}
