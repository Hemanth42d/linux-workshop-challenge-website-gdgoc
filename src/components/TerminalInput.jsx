/**
 * Terminal-style input that looks like typing in an Ubuntu terminal.
 */
export default function TerminalInput({ value, onChange, disabled, onSubmit, placeholder = 'Enter command...', user = 'participant', host = 'linux-challenge' }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) onSubmit();
  };

  return (
    <div className="bg-[#300a24] rounded-lg border border-[#5c3566]/50 overflow-hidden focus-within:border-[#34e534]/50 focus-within:ring-1 focus-within:ring-[#34e534]/20 transition-all">
      <div className="flex items-center px-4 py-3">
        <span className="text-[#34e534] font-mono text-sm font-bold shrink-0">{user}@{host}</span>
        <span className="text-[#eeeeec] font-mono text-sm shrink-0">:</span>
        <span className="text-[#729fcf] font-mono text-sm font-bold shrink-0">~</span>
        <span className="text-[#eeeeec] font-mono text-sm shrink-0">$ </span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[#eeeeec] font-mono text-sm placeholder-[#888a85]/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ml-1"
          autoComplete="off"
          spellCheck="false"
        />
        <span className="text-[#34e534] animate-pulse-slow font-mono">█</span>
      </div>
    </div>
  );
}
