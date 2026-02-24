const colors = {
  waiting: 'bg-[#FBBC05]/15 text-[#FBBC05] border-[#FBBC05]/30',
  round_active: 'bg-[#34A853]/15 text-[#34e534] border-[#34A853]/30',
  round_ended: 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/30',
  challenge_ended: 'bg-[#888a85]/15 text-[#888a85] border-[#888a85]/30',
};

const labels = {
  waiting: 'Standby',
  round_active: 'Round Active',
  round_ended: 'Round Complete',
  challenge_ended: 'Challenge Complete',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-mono border ${colors[status] || colors.waiting}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'round_active' ? 'bg-[#34e534] animate-pulse-slow' : 'bg-current opacity-50'}`} />
      {labels[status] || status}
    </span>
  );
}
