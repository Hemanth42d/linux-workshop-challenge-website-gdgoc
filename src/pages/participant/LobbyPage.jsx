import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import UbuntuTerminal, { TerminalPrompt, TerminalOutput } from '../../components/UbuntuTerminal';
import MatrixRain from '../../components/MatrixRain';
import StatusBadge from '../../components/StatusBadge';
import { DEFAULT_CONFIG } from '../../services/scoring';

export default function LobbyPage() {
  const { gameState, userName } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState?.status === 'round_active') navigate('/challenge');
  }, [gameState?.status, navigate]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in relative">
      {/* Matrix rain background while waiting */}
      {gameState?.status === 'waiting' && <MatrixRain columns={15} />}

      <h1 className="text-2xl font-bold text-[#eeeeec] mb-6 font-mono relative z-10">Lobby</h1>

      <div className="relative z-10">
        <UbuntuTerminal title={`${userName}@linux-challenge: ~`}>
          <TerminalPrompt user={userName} path="~">whoami</TerminalPrompt>
          <TerminalOutput>{userName}</TerminalOutput>

          <div className="mt-3">
            <TerminalPrompt user={userName} path="~">challenge --status</TerminalPrompt>
            <div className="mt-1">
              {gameState ? <StatusBadge status={gameState.status} /> : <TerminalOutput color="text-[#888a85]">Connecting to server...</TerminalOutput>}
            </div>
          </div>

          <div className="mt-3">
            <TerminalPrompt user={userName} path="~">challenge --wait</TerminalPrompt>
            <TerminalOutput color="text-[#FBBC05]">
              <span className="animate-pulse-slow">⏳ Waiting for admin to start the round...</span>
            </TerminalOutput>
          </div>

          {/* Typing animation while waiting */}
          {gameState?.status === 'waiting' && (
            <div className="mt-3">
              <TerminalPrompt user={userName} path="~">neofetch</TerminalPrompt>
              <div className="mt-1 text-xs text-[#888a85] font-mono space-y-0.5">
                <p className="text-[#34e534]">       .-/+oossssoo+/-.</p>
                <p className="text-[#34e534]">    `:+ssssssssssssssss+:`</p>
                <p className="text-[#34e534]">  -+ssssssssssssssssssss+-    <span className="text-[#729fcf]">{userName}@linux-challenge</span></p>
                <p className="text-[#34e534]"> .ossssssssssssssssssssso.    <span className="text-[#888a85]">──────────────────────</span></p>
                <p className="text-[#34e534]">  /sssssssssssssssssssss/     <span className="text-[#ad7fa8]">OS:</span> <span className="text-[#eeeeec]">{gameState?.challengeName || DEFAULT_CONFIG.challengeName} v1.0</span></p>
                <p className="text-[#34e534]">   `:+ssssssssssssss+:`      <span className="text-[#ad7fa8]">Status:</span> <span className="text-[#FBBC05]">Standby</span></p>
                <p className="text-[#34e534]">      .-/+oossoo+/-.         <span className="text-[#ad7fa8]">Shell:</span> <span className="text-[#eeeeec]">bash 5.1</span></p>
              </div>
            </div>
          )}

          {gameState?.status === 'challenge_ended' && (
            <div className="mt-3">
              <TerminalPrompt user={userName} path="~">echo $CHALLENGE_STATUS</TerminalPrompt>
              <TerminalOutput>Challenge complete. Check the leaderboard for results.</TerminalOutput>
            </div>
          )}

          <div className="mt-4">
            <TerminalPrompt user={userName} path="~">
              <span className="terminal-cursor" />
            </TerminalPrompt>
          </div>
        </UbuntuTerminal>
      </div>
    </div>
  );
}
