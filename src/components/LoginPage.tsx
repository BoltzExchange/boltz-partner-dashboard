import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Loader2, Key, Lock, Zap } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-navy-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <img src="/boltz-logo.svg" alt="Boltz" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-semibold text-text-primary mb-2">
            Partner Dashboard
          </h1>
          <p className="text-text-secondary">
            Sign in with your Boltz API credentials
          </p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-navy-600/80 backdrop-blur-sm border border-navy-400/50 rounded-2xl p-8 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="space-y-5">
            <div>
              <label 
                htmlFor="apiKey" 
                className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
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
                className="w-full px-4 py-3 bg-navy-700 border border-navy-400/50 rounded-xl 
                         text-text-primary placeholder-text-muted
                         focus:outline-none focus:ring-2 focus:ring-boltz-primary/50 focus:border-boltz-primary
                         transition-all duration-200 font-mono text-sm"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <div>
              <label 
                htmlFor="apiSecret" 
                className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2"
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
                className="w-full px-4 py-3 bg-navy-700 border border-navy-400/50 rounded-xl 
                         text-text-primary placeholder-text-muted
                         focus:outline-none focus:ring-2 focus:ring-boltz-primary/50 focus:border-boltz-primary
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
              className="w-full py-3 px-4 bg-boltz-primary hover:bg-boltz-primary-light disabled:opacity-50 
                       text-navy-700 font-semibold rounded-xl
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-boltz-primary focus:ring-offset-2 focus:ring-offset-navy-600
                       hover:shadow-[0_0_20px_rgba(232,203,43,0.4)]
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
        </form>

        <div className="mt-6 p-4 bg-navy-600/40 rounded-xl border border-navy-400/30 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-text-muted text-xs text-center">
            🔒 Your credentials are stored locally and never leave your browser.
          </p>
        </div>

        <p className="text-center text-text-muted text-sm mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Powered by{' '}
          <a 
            href="https://boltz.exchange" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-boltz-link hover:text-boltz-link-hover transition-colors"
          >
            Boltz
          </a>
        </p>
      </div>
    </div>
  );
}
