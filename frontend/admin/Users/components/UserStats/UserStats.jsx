import "./UserStats.css";
import { Users, UserCheck, Radio, UserX } from "lucide-react";
const UserCard = ({ title, count, type }) => {
    const getIcon = () => {
        switch (type) {
            case "total":
                return <Users size={22}/>;
            case "active":
                return <UserCheck size={22}/>;
            case "live":
                return <Radio size={22}/>;
            case "blocked":
                return <UserX size={22}/>;
        }
    };
    return (<div className="user-card">
            <div>
                <span className="user-card-title">{title}</span>
                <h2>{count.toLocaleString()}</h2>
            </div>
            <div className={`user-icon ${type}`}>{getIcon()}</div>
        </div>);
};
const UserStats = ({ summary }) => {
    if (!summary)
        return null;
    return (<div className="user-stats">
            <UserCard title="TOTAL USERS" count={summary.totalUsers} type="total"/>
            <UserCard title="ACTIVE USERS" count={summary.activeUsers} type="active"/>
            <UserCard title="LIVE USERS" count={summary.liveUsers} type="live"/>
            <UserCard title="BLOCKED USERS" count={summary.blockedUsers} type="blocked"/>
        </div>);
};
export default UserStats;
