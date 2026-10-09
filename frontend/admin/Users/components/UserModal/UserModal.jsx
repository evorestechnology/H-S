import { useState, useEffect } from "react";
import "./UserModal.css";
import { X } from "lucide-react";
const UserModal = ({ open, userToEdit, onClose, onSubmit }) => {
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [age, setAge] = useState(25);
    const [gender, setGender] = useState("Male");
    const [status, setStatus] = useState("Active");
    useEffect(() => {
        if (userToEdit) {
            setFullname(userToEdit.fullname || "");
            setUsername(userToEdit.username || "");
            setEmail(userToEdit.email || "");
            setPhone(userToEdit.phone || "");
            setCountry(userToEdit.country || "");
            setShippingAddress(userToEdit.shippingAddress || "");
            setAge(userToEdit.age || 25);
            setGender(userToEdit.gender || "Male");
            setStatus(userToEdit.status || "Active");
        }
        else {
            setFullname("");
            setUsername("");
            setEmail("");
            setPhone("");
            setCountry("United States");
            setShippingAddress("");
            setAge(25);
            setGender("Male");
            setStatus("Active");
        }
    }, [userToEdit, open]);
    if (!open)
        return null;
    const handleSubmit = () => {
        if (!fullname.trim()) {
            alert("Please enter full name");
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            alert("Please enter a valid email address");
            return;
        }
        onSubmit({
            id: userToEdit?.id,
            fullname: fullname.trim(),
            username: username.trim() || fullname.toLowerCase().replace(/\s+/g, "_"),
            email: email.trim(),
            phone: phone.trim() || "+1 000-000-0000",
            country: country.trim() || "United States",
            shippingAddress: shippingAddress.trim() || "123 Main St, City, Country",
            age: Number(age) || 25,
            gender,
            status
        });
        onClose();
    };
    return (<div className="user-modal-overlay">
            <div className="user-modal">
                <div className="user-modal-header">
                    <h2>{userToEdit ? "Edit User Details & Status" : "Add New User"}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20}/>
                    </button>
                </div>

                <div className="user-modal-body">
                    <div className="form-grid">
                        <div className="form-field">
                            <label>Full Name</label>
                            <input type="text" placeholder="e.g. Alex Morgan" value={fullname} onChange={(e) => setFullname(e.target.value)}/>
                        </div>

                        <div className="form-field">
                            <label>Username</label>
                            <input type="text" placeholder="e.g. alex_morgan" value={username} onChange={(e) => setUsername(e.target.value)}/>
                        </div>

                        <div className="form-field">
                            <label>Email Address</label>
                            <input type="email" placeholder="e.g. alex@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>

                        <div className="form-field">
                            <label>Phone Number</label>
                            <input type="text" placeholder="e.g. +1 987-654-3210" value={phone} onChange={(e) => setPhone(e.target.value)}/>
                        </div>

                        <div className="form-field">
                            <label>Country</label>
                            <input type="text" placeholder="e.g. United States" value={country} onChange={(e) => setCountry(e.target.value)}/>
                        </div>

                        <div className="form-field">
                            <label>Age</label>
                            <input type="number" placeholder="e.g. 28" value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}/>
                        </div>

                        <div className="form-field">
                            <label>Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Account Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="Active">Active</option>
                                <option value="Live">Live</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Blocked">Blocked</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field full-width">
                        <label>Shipping Address</label>
                        <input type="text" placeholder="e.g. 742 Evergreen Terr, Springfield, IL" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)}/>
                    </div>
                </div>

                <div className="user-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSubmit}>
                        {userToEdit ? "Save Changes" : "Add User"}
                    </button>
                </div>
            </div>
        </div>);
};
export default UserModal;
