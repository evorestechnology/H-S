import "./UsersHeader.css";
import { UserPlus } from "lucide-react";
const UsersHeader = ({ onNewUser }) => {
    return (<div className="users-header">
            <div className="users-header-left">
                <h1>Users</h1>
                <p>
                    Manage registered user profiles, contact details, shipping addresses, and account status.
                </p>
            </div>
            {onNewUser && (<button className="add-user-btn" onClick={onNewUser}>
                    <UserPlus size={18}/>
                    <span>Add New User</span>
                </button>)}
        </div>);
};
export default UsersHeader;
