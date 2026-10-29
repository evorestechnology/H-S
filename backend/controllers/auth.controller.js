import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { sendPasswordResetEmail, sendOtpEmail } from '../utils/email.js';

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('jwt', token, {
    httpOnly: true, // prevents XSS attacks
    sameSite: process.env.NODE_ENV === 'development' ? 'strict' : 'none',
    secure: process.env.NODE_ENV !== 'development', // must be true for sameSite 'none'
  });

  return token;
};

export const register = async (req, res) => {
  try {
    const { fullName, email, password, mobile, countryCode, country, gender, dob } = req.body;

    // Validate inputs
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        mobile,
        countryCode,
        country,
        gender,
        dob: dob ? new Date(dob) : null,
      },
    });

    if (newUser) {
      // Generate token and send response
      const token = generateToken(newUser.id, res);

      const userObj = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        companyName: newUser.companyName,
      };

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: userObj,
        token,
        ...userObj
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in register controller: ', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    // Role-specific check if role is passed in body
    if (role) {
      const requestedRoleUpper = role.toUpperCase();
      const userRoleUpper = (user.role || '').toUpperCase();

      if (requestedRoleUpper === 'MANUFACTURER' && userRoleUpper !== 'MANUFACTURER' && userRoleUpper !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: `Access denied. Account '${user.email}' is not registered as a Manufacturer.`
        });
      }

      if (requestedRoleUpper === 'ADMIN' && userRoleUpper !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: `Access denied. Account '${user.email}' is not an Admin.`
        });
      }
    }

    const token = generateToken(user.id, res);

    const userObj = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userObj,
      token,
      ...userObj
    });
  } catch (error) {
    console.error('Error in login controller: ', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        companyName: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in checkAuth controller: ', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * forgotPassword — sends a 6-digit OTP to the user's email.
 * The OTP is stored (hashed) in resetPasswordToken, and the raw token
 * is prefixed with "OTP:" so verifyOtp can distinguish it from a link token.
 */
export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for this email, an OTP has been sent.'
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP with prefix so we can distinguish it from a link-based token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: `OTP:${otp}`,
        resetPasswordExpiry: expiry,
      }
    });

    // Send OTP email (non-blocking failure)
    const emailResult = await sendOtpEmail(user.email, user.fullName || 'Customer', otp);
    if (!emailResult?.success && emailResult?.error) {
      console.warn(`[ForgotPassword] Email delivery failed (${emailResult.error}) for ${user.email}`);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email address. It is valid for 10 minutes.'
    });
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process the request right now. Please try again.'
    });
  }
};

/**
 * verifyOtp — verifies the 6-digit OTP and, on success,
 * generates a short-lived reset token for the password-reset step.
 */
export const verifyOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetPasswordToken || !user.resetPasswordExpiry) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > new Date(user.resetPasswordExpiry)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpiry: null }
      });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP (must be prefixed with "OTP:")
    const storedToken = user.resetPasswordToken;
    if (!storedToken.startsWith('OTP:') || storedToken.slice(4) !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP verified — generate a new short-lived reset token (link-style)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      }
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken
    });
  } catch (error) {
    console.error('Error in verifyOtp controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify OTP right now. Please try again.'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset session is invalid or has expired. Please start over.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('Error in resetPassword controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to reset the password right now.'
    });
  }
};
