import { prisma } from '../lib/prisma.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        countryCode: true,
        country: true,
        gender: true,
        dob: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      let age = null;
      if (user.dob) {
        const diff = Date.now() - user.dob.getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      }
      res.json({ ...user, age });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (user) {
      const { fullName, email, mobile, countryCode, country, gender, dob } = req.body;

      // Optional: Check if email is being updated and if it's already taken by another user
      if (email && email !== user.email) {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use by another account' });
        }
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          fullName: fullName || user.fullName,
          email: email || user.email,
          mobile: mobile || user.mobile,
          countryCode: countryCode || user.countryCode,
          country: country || user.country,
          gender: gender || user.gender,
          dob: dob ? new Date(dob) : user.dob,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          countryCode: true,
          country: true,
          gender: true,
          dob: true,
          role: true,
        },
      });

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users and count
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const count = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        countryCode: true,
        country: true,
        gender: true,
        dob: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const usersWithAge = users.map(u => {
      let age = null;
      if (u.dob) {
        const diff = Date.now() - u.dob.getTime();
        age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
      }
      return { ...u, age };
    });

    res.json({ count, users: usersWithAge });
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Create user by admin
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { fullName, fullname, email, mobile, phone, country, gender, age, shippingAddress } = req.body;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const nameToUse = fullName || fullname || 'New User';

    const newUser = await prisma.user.create({
      data: {
        fullName: nameToUse,
        email,
        password: '$2a$10$defaultDummyHashedPasswordForAdminCreatedUsers',
        mobile: mobile || phone,
        country: country || 'United States',
        gender: gender || 'Male',
        status: 'Active'
      }
    });

    res.status(201).json({
      id: newUser.id,
      fullname: newUser.fullName,
      email: newUser.email,
      phone: newUser.mobile,
      country: newUser.country,
      status: newUser.status,
      joinedDate: newUser.createdAt.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user status:', error.message);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};

// @desc    Update user details by admin
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, fullname, email, mobile, phone, country, gender, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName || fullname,
        email,
        mobile: mobile || phone,
        country,
        gender,
        status
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user details:', error.message);
    res.status(500).json({ message: 'Server error while updating user details' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// @desc    Get all manufacturers (for admin dropdown assignment)
// @route   GET /api/users/manufacturers
// @access  Private
export const getManufacturers = async (req, res) => {
  try {
    const manufacturers = await prisma.user.findMany({
      where: { role: 'MANUFACTURER' },
      select: {
        id: true,
        fullName: true,
        companyName: true,
        email: true,
        status: true
      },
      orderBy: { fullName: 'asc' }
    });

    return res.status(200).json({
      success: true,
      message: 'Manufacturers fetched successfully',
      data: manufacturers
    });
  } catch (error) {
    console.error('Error fetching manufacturers:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching manufacturers',
      data: null,
      errors: [error.message]
    });
  }
};

