// Reusable card for stats
const StatCard = ({ label, value }) => (
  <div className="w-60 px-6 py-4 rounded-xl bg-[#252636] border-[#7F2DBD] border-opacity-30 hover:shadow-md hover:shadow-[#F06292]/50 transition-shadow duration-300">
    <h2 className="text-lg font-semibold text-[#F06292]">{label}</h2>
    <p className="text-white text-xl font-bold">{value}</p>
  </div>
);

export default StatCard;