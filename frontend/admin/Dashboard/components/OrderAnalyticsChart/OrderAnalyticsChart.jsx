import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "../SalesOverviewChart/Charts.css";
const OrderAnalyticsChart = ({ data, isLoading }) => {
    return (<div className="chart-card">
            <div className="chart-header">
                <div className="chart-title-group">
                    <h2 className="chart-title">Order Analytics</h2>
                    <p className="chart-subtitle">Order status breakdown</p>
                </div>
            </div>

            <div className="chart-body">
                {isLoading ? (<div className="chart-skeleton"></div>) : (<ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10}/>
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }}/>
                            <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)' }}/>
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}/>
                            <Bar dataKey="completed" name="Completed" stackId="a" fill="#15803D" radius={[0, 0, 4, 4]}/>
                            <Bar dataKey="pending" name="Pending" stackId="a" fill="#F59E0B"/>
                            <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>)}
            </div>
        </div>);
};
export default OrderAnalyticsChart;
