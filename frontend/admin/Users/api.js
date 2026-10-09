import apiClient from "../../shared/services/apiClient";
export const getUsers = async () => {
    const data = await apiClient.get("/users");
    const rawUsers = data.users || (Array.isArray(data) ? data : []);
    const users = rawUsers.map((u) => {
        let age = u.age;
        if (age === null && u.dob) {
            const diff = Date.now() - new Date(u.dob).getTime();
            age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
        }
        const phone = u.mobile
            ? (u.countryCode ? `${u.countryCode} ${u.mobile}` : u.mobile)
            : (u.phone || "N/A");
        return {
            id: u.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            username: u.username || "",
            fullname: u.fullName || u.fullname || u.username || "N/A",
            fullName: u.fullName || u.fullname || "",
            phone,
            mobile: u.mobile,
            countryCode: u.countryCode,
            country: u.country || "N/A",
            email: u.email || "",
            shippingAddress: u.shippingAddress || "N/A",
            age: age ?? null,
            gender: u.gender || "Male",
            status: u.status || "Active",
            joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : u.joinedDate,
            dob: u.dob || null,
            role: u.role,
            createdAt: u.createdAt
        };
    });
    return {
        summary: {
            totalUsers: data.count ?? users.length,
            activeUsers: users.filter((u) => u.status === "Active").length,
            liveUsers: users.filter((u) => u.status === "Live").length,
            blockedUsers: users.filter((u) => u.status === "Blocked").length
        },
        users
    };
};
// ==========================================
// 1.1 GET USER PROFILE (GET /api/users/profile)
// ==========================================
export const getUserProfile = async () => {
    const u = await apiClient.get("/users/profile");
    let age = u.age;
    if (age === null && u.dob) {
        const diff = Date.now() - new Date(u.dob).getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }
    return {
        id: u.id,
        username: u.username || "",
        fullname: u.fullName || u.fullname || u.username || "N/A",
        fullName: u.fullName || u.fullname || "",
        phone: u.mobile ? (u.countryCode ? `${u.countryCode} ${u.mobile}` : u.mobile) : (u.phone || "N/A"),
        mobile: u.mobile,
        countryCode: u.countryCode,
        country: u.country || "N/A",
        email: u.email || "",
        shippingAddress: u.shippingAddress || "N/A",
        age: age ?? null,
        gender: u.gender || "Male",
        status: u.status || "Active",
        joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : u.joinedDate,
        dob: u.dob || null,
        role: u.role,
        createdAt: u.createdAt
    };
};
// ==========================================
// 1.2 UPDATE USER PROFILE (PUT /api/users/profile)
// ==========================================
export const updateUserProfile = async (userData) => {
    return await apiClient.put("/users/profile", {
        fullName: userData.fullName || userData.fullname,
        email: userData.email,
        mobile: userData.mobile || userData.phone,
        countryCode: userData.countryCode,
        country: userData.country,
        gender: userData.gender,
        dob: userData.dob
    });
};
// ==========================================
// 2. CREATE NEW USER (POST /api/users)
// ==========================================
export const createUser = async (userData) => {
    return await apiClient.post("/users", userData);
};
// ==========================================
// 3. UPDATE USER STATUS (PATCH /api/users/:id/status)
// ==========================================
export const updateUserStatus = async (id, status) => {
    await apiClient.patch(`/users/${id}/status`, { status });
    return true;
};
// ==========================================
// 4. UPDATE USER DETAILS (PUT /api/users/:id)
// ==========================================
export const updateUserDetails = async (id, userData) => {
    return await apiClient.put(`/users/${id}`, userData);
};
// ==========================================
// 5. DELETE USER (DELETE /api/users/:id)
// ==========================================
export const deleteUser = async (id) => {
    await apiClient.delete(`/users/${id}`);
    return true;
};
