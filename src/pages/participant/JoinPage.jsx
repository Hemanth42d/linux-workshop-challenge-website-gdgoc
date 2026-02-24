import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../../services/firestore';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Terminal, ArrowRight } from 'lucide-react';

export default function JoinPage() {
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !registerNumber.trim()) {
      setError('Please fill in all fields');
      return;
    }
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
      setError(err.message === 'timeout' ? 'Connection timed out. Check your internet and try again.' : 'Failed to join. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4285F4] mb-4">
            <Terminal className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Linux Workshop Challenge</h1>
          <p className="text-gray-500 mt-1 text-sm">Test your Linux command skills in real time</p>
        </div>
        <Card>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input label="Full Name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Register Number / Email" placeholder="Enter register number or email" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} />
            {error && <p className="text-sm text-[#EA4335]">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
              {loading ? 'Joining...' : <><span>Join Challenge</span><ArrowRight size={16} /></>}
            </Button>
          </form>
        </Card>
        <p className="text-center text-xs text-gray-400 mt-6">Powered by Firebase · Real-time Challenge Platform</p>
      </div>
    </div>
  );
}
