import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser, subscribeGameState } from '../../services/firestore';
import { DEFAULT_CONFIG } from '../../services/scoring';
import UbuntuTerminal, { TerminalPrompt, TerminalOutput } from '../../components/UbuntuTerminal';
import Button from '../../components/Button';

export default function JoinPage() {
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeGameState(setGameState);
    return unsub;
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !registerNumber.trim()) { setError('All fields are required'); return; }
    setLoading(true);
    setError('');
    try {
      const joinPromise = addUser({ name: name.trim(), registerNumber: registerNumber.trim() });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000));
      const userId = await Promise.race([joinPromise, timeoutPromise]);
      localStorage.setItem('workshopUserId', userId);
      localStorage.setItem('workshopUserName', name.trim());
      navigate('/lobby');
    } catch (err) {
      setError(err.message === 'timeout' ? 'Connection timed out. Check your network.' : 'Failed to connect. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3c1130] p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#300a24] border border-[#5c3566] mb-4">
            <span className="text-[#34e534] font-mono text-2xl font-bold">$_</span>
          </div>
          <h1 className="text-2xl font-bold text-[#eeeeec]">{gameState?.challengeName || DEFAULT_CONFIG.challengeName}</h1>
          <p className="text-[#ad7fa8] mt-1 text-sm font-mono">{gameState?.challengeTagline || DEFAULT_CONFIG.challengeTagline}</p>
        </div>

        {/* Ubuntu terminal join form */}
        <UbuntuTerminal title="join@linux-challenge: ~">
          <form onSubmit={handleJoin}>
            <TerminalPrompt user="guest" path="~">echo "Welcome to {gameState?.challengeName || DEFAULT_CONFIG.challengeName}"</TerminalPrompt>
            <TerminalOutput>Welcome to {gameState?.challengeName || DEFAULT_CONFIG.challengeName}</TerminalOutput>

            <div className="mt-4">
              <TerminalPrompt user="guest" path="~">read -p "Name: " PARTICIPANT_NAME</TerminalPrompt>
              <div className="flex items-center mt-1 ml-0">
                <span className="text-[#eeeeec] mr-1">Name: </span>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 bg-transparent text-[#34e534] font-mono text-sm placeholder-[#888a85]/40 focus:outline-none caret-[#34e534]"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-3">
              <TerminalPrompt user="guest" path="~">read -p "Register ID: " REG_ID</TerminalPrompt>
              <div className="flex items-center mt-1 ml-0">
                <span className="text-[#eeeeec] mr-1">Register ID: </span>
                <input
                  type="text" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="Register number or email"
                  className="flex-1 bg-transparent text-[#34e534] font-mono text-sm placeholder-[#888a85]/40 focus:outline-none caret-[#34e534]"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <div className="mt-3">
                <TerminalOutput color="text-[#EA4335]">Error: {error}</TerminalOutput>
              </div>
            )}

            <div className="mt-5">
              <Button variant="terminal" type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <span className="font-mono">Connecting<span className="animate-pulse-slow">...</span></span>
                ) : (
                  <span className="font-mono">$ ./join-challenge.sh</span>
                )}
              </Button>
            </div>
          </form>
        </UbuntuTerminal>

        <p className="text-center text-xs text-[#888a85] mt-6 font-mono">
          Powered by Firebase · Real-time Challenge Platform
        </p>
      </div>
    </div>
  );
}
