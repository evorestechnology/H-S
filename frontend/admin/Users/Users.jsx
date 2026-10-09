import { useEffect, useMemo, useState } from "react";
import "./Users.css";
import { getUsers, createUser, updateUserDetails, updateUserStatus } from "./api";
import UsersHeader from "./components/UsersHeader/UsersHeader";
import UserStats from "./components/UserStats/UserStats";
import SearchBar from "./components/SearchBar/SearchBar";
import UserTable from "./components/UserTable/UserTable";
import Pagination from "./components/Pagination/Pagination";
import UserModal from "./components/UserModal/UserModal";
const PAGE_SIZE = 5;
const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All Users");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadUsersData();
    }, []);
    const loadUsersData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUsers();
            setUsers(response.users || []);
        }
        catch (err) {
            console.error("Error loading live users:", err);
            setError(err.message || "Failed to fetch users from database");
        }
        finally {
            setLoading(false);
        }
    };
    const summary = useMemo(() => {
        return {
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.status === "Active").length,
            liveUsers: users.filter((u) => u.status === "Live").length,
            blockedUsers: users.filter((u) => u.status === "Blocked").length
        };
    }, [users]);
    const filteredUsers = useMemo(() => {
        return users.filter((item) => {
            const matchesStatus = filter === "All Users" ? true : item.status === filter;
            const keyword = search.toLowerCase();
            const matchesSearch = item.fullname.toLowerCase().includes(keyword) ||
                item.username.toLowerCase().includes(keyword) ||
                item.email.toLowerCase().includes(keyword) ||
                item.phone.toLowerCase().includes(keyword) ||
                item.country.toLowerCase().includes(keyword) ||
                item.id.toLowerCase().includes(keyword) ||
                item.shippingAddress.toLowerCase().includes(keyword);
            return matchesStatus && matchesSearch;
        });
    }, [users, filter, search]);
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const handleChangeStatus = async (id, newStatus) => {
        const previousUsers = [...users];
        // Optimistic UI update
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status: newStatus } : user)));
        try {
            await updateUserStatus(id, newStatus);
        }
        catch (err) {
            console.error("Error updating user status on server:", err);
            alert(err.message || "Failed to update user status on server");
            setUsers(previousUsers); // Rollback on failure
        }
    };
    const handleOpenAddModal = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };
    const handleOpenEditModal = (user) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };
    const handleSaveUser = async (userData) => {
        setIsModalOpen(false);
        setLoading(true);
        try {
            if (userData.id) {
                // Persist updated user to backend database
                await updateUserDetails(userData.id, userData);
            }
            else {
                // Persist newly created user to backend database
                await createUser(userData);
            }
            await loadUsersData();
        }
        catch (err) {
            console.error("Error saving user to database:", err);
            alert(err.message || "Failed to save user to database");
            setLoading(false);
        }
    };
    return (<div className="users-page">
            <UsersHeader onNewUser={handleOpenAddModal}/>

            <UserStats summary={summary}/>

            <SearchBar value={search} onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
        }} activeFilter={filter} onFilterChange={(val) => {
            setFilter(val);
            setCurrentPage(1);
        }}/>

            <UserTable users={paginatedUsers} onEditUser={handleOpenEditModal} onChangeStatus={handleChangeStatus}/>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>

            <UserModal open={isModalOpen} userToEdit={userToEdit} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveUser}/>
        </div>);
};
export default Users;
