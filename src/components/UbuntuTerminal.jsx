/**
 * Ubuntu-style terminal window component.
 * Mimics the look of GNOME Terminal on Ubuntu.
 */
export default function UbuntuTerminal({ title = 'participant@linux-challenge: ~', children, className = '' }) {
  return (
    <div className={`rounded-xl overflow-hidden shadow-2xl border border-[#5c3566]/50 ${className}`}>
      {/* Ubuntu GNOME title bar */}
      <div className="bg-[#201a1b] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <button className="w-3.5 h-3.5 rounded-full bg-[#EA4335] hover:brightness-110 cursor-default" aria-hidden="true" tabIndex={-1} />
            <button className="w-3.5 h-3.5 rounded-full bg-[#FBBC05] hover:brightness-110 cursor-default" aria-hidden="true" tabIndex={-1} />
            <button className="w-3.5 h-3.5 rounded-full bg-[#34A853] hover:brightness-110 cursor-default" aria-hidden="true" tabIndex={-1} />
          </div>
        </div>
        <span className="text-xs text-[#888a85] font-mono truncate max-w-[60%]">{title}</span>
        <div className="w-16" /> {/* spacer for centering */}
      </div>
      {/* Terminal body — Ubuntu default purple-dark bg */}
      <div className="bg-[#300a24] p-5 font-mono text-sm leading-relaxed min-h-[120px]">
        {children}
      </div>
    </div>
  );
}

/**
 * A single terminal prompt line.
 */
export function TerminalPrompt({ user = 'participant', host = 'linux-challenge', path = '~', children }) {
  return (
    <div className="flex flex-wrap gap-0">
      <span className="text-[#34e534] font-bold">{user}@{host}</span>
      <span className="text-[#eeeeec]">:</span>
      <span className="text-[#729fcf] font-bold">{path}</span>
      <span className="text-[#eeeeec]">$ </span>
      <span className="text-[#eeeeec]">{children}</span>
    </div>
  );
}

/**
 * Terminal output line (indented, dimmer).
 */
export function TerminalOutput({ children, color = 'text-[#eeeeec]' }) {
  return <div className={`${color} pl-0 mt-0.5`}>{children}</div>;
}
