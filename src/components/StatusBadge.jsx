const colors = {
  waiting: 'bg-yellow-100 text-yellow-800',
  round_active: 'bg-green-100 text-green-800',
  round_ended: 'bg-red-100 text-red-800',
  challenge_ended: 'bg-gray-100 text-gray-800',
};

const labels = {
  waiting: 'Waiting',
  round_active: 'Round Active',
  round_ended: 'Round Ended',
  challenge_ended: 'Challenge Ended',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.waiting}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'round_active' ? 'bg-green-500 animate-pulse-slow' : 'bg-current opacity-50'}`} />
      {labels[status] || status}
    </span>
  );
}
