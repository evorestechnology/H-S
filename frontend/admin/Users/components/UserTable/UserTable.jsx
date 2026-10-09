import "./UserTable.css";
import UserActions from "../UserActions/UserActions";
const UserTable = ({ users, onEditUser, onChangeStatus }) => {
    return (<div className="user-table-container">
            <table className="user-table">
                <thead>
                    <tr>
                        <th className="col-user-id">USER ID</th>
                        <th className="col-user-profile">FULLNAME</th>
                        <th className="col-username">USERNAME</th>
                        <th className="col-email">EMAIL ID</th>
                        <th className="col-phone">PHONE NUMBER</th>
                        <th className="col-country">COUNTRY</th>
                        <th className="col-address">SHIPPING ADDRESS</th>
                        <th className="col-age">AGE</th>
                        <th className="col-gender">GENDER</th>
                        <th className="col-status">STATUS</th>
                        <th className="col-actions">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
            const statusClass = user.status.toLowerCase();
            return (<tr key={user.id}>
                                <td className="col-user-id-val">{user.id}</td>
                                <td>
                                    <div className="user-info">
                                        <span className="user-name">{user.fullname}</span>
                                    </div>
                                </td>
                                <td className="col-username-val">@{user.username}</td>
                                <td className="col-text">{user.email}</td>
                                <td className="col-text">{user.phone}</td>
                                <td className="col-text font-medium">{user.country}</td>
                                <td className="col-address" title={user.shippingAddress}>
                                    {user.shippingAddress}
                                </td>
                                <td className="col-text font-medium">{user.age}</td>
                                <td className="col-text">{user.gender}</td>
                                <td>
                                    <span className={`user-status-badge ${statusClass}`}>
                                        <span className="user-status-dot"></span>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <UserActions user={user} onEdit={onEditUser} onChangeStatus={onChangeStatus}/>
                                </td>
                            </tr>);
        })}
                </tbody>
            </table>
        </div>);
};
export default UserTable;
