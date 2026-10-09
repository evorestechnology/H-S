import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import "./Charts.css"; // Shared CSS for both charts
const PERIOD_OPTIONS = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "3 Months", value: "90d" },
    { label: "1 Year", value: "1y" }
];
const SalesOverviewChart = ({ data, isLoading, period, onPeriodChange }) => {
    return (<div className="chart-card">
            <div className="chart-header">
                <div className="chart-title-group">
                    <h2 className="chart-title">Sales Overview</h2>
                    <p className="chart-subtitle">Revenue generated over time</p>
                </div>
                <div className="chart-filters">
                    {PERIOD_OPTIONS.map(opt => (<button key={opt.value} className={`chart-filter-btn ${period === opt.value ? "active" : ""}`} onClick={() => onPeriodChange(opt.value)}>
                            {opt.label}
                        </button>))}
                </div>
            </div>

            <div className="chart-body">
                {isLoading ? (<div className="chart-skeleton"></div>) : (<ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`}/>
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)' }} formatter={(value) => [`₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}/>
                            <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}/>
                        </LineChart>
                    </ResponsiveContainer>)}
            </div>
        </div>);
};
export default SalesOverviewChart;
