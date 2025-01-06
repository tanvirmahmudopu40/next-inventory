export default function StatCard({ title, value, icon, trend, color, trendDown }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <span className={`text-sm ${trendDown ? 'text-red-500' : 'text-green-500'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
} 