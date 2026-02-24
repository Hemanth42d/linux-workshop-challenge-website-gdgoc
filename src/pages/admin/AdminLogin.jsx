import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/auth';
import UbuntuTerminal, { TerminalPrompt, TerminalOutput } from '../../components/UbuntuTerminal';
import Button from '../../components/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('All fields required'); return; }
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch {
      setError('Authentication failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3c1130] p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#300a24] border border-[#5c3566] mb-4">
            <span className="text-[#EA4335] font-mono text-xl font-bold">#</span>
          </div>
          <h1 className="text-xl font-bold text-[#eeeeec]">Admin Access</h1>
          <p className="text-[#ad7fa8] text-sm font-mono mt-1">Challenge Control Panel</p>
        </div>

        <UbuntuTerminal title="root@linux-challenge: ~">
          <form onSubmit={handleLogin}>
            <TerminalPrompt user="root" path="~">sudo authenticate --admin</TerminalPrompt>
            <TerminalOutput color="text-[#888a85]">[sudo] credentials required for admin access</TerminalOutput>

            <div className="mt-4">
              <div className="flex items-center px-3 py-2.5 rounded-lg border-2 border-[#5c3566] bg-[#2d0922] focus-within:border-[#ad7fa8]">
                <span className="text-[#eeeeec] font-mono text-sm mr-1 shrink-0">Email: </span>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="flex-1 bg-transparent text-[#34e534] font-mono text-sm placeholder-[#ad7fa8] focus:outline-none caret-[#34e534]"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center px-3 py-2.5 rounded-lg border-2 border-[#5c3566] bg-[#2d0922] focus-within:border-[#ad7fa8]">
                <span className="text-[#eeeeec] font-mono text-sm mr-1 shrink-0">Password: </span>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[#34e534] font-mono text-sm placeholder-[#ad7fa8] focus:outline-none caret-[#34e534]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-[#888a85] hover:text-[#ad7fa8] cursor-pointer transition-colors shrink-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-2">
                <TerminalOutput color="text-[#EA4335]">Error: {error}</TerminalOutput>
              </div>
            )}

            <div className="mt-5">
              <Button type="submit" disabled={loading} className="w-full font-mono">
                {loading ? 'Authenticating...' : '$ sudo login --admin'}
              </Button>
            </div>
          </form>
        </UbuntuTerminal>
      </div>
    </div>
  );
}
