import { prisma } from '../lib/prisma.js';

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' }, // Default address comes first
    });
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    // If this is set to default, unset any existing default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if this is their first address
    const existingAddresses = await prisma.address.count({
      where: { userId: req.user.id },
    });

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || existingAddresses === 0, // Make default if it's the first one
      },
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Error adding address:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;
    const addressId = req.params.id;

    // Verify address belongs to user
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
      },
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id: addressId } });

    // If we deleted the default address, make the newest remaining address the default
    if (address.isDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { id: 'desc' },
      });

      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    res.json({ message: 'Address removed' });
  } catch (error) {
    console.error('Error deleting address:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset current default
    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error('Error setting default address:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
