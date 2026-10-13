import { prisma } from '../lib/prisma.js';

const isAdmin = (role) => ['ADMIN', 'ADMINISTRATOR'].includes((role || '').toUpperCase());
const isManufacturer = (role) => (role || '').toUpperCase() === 'MANUFACTURER';

const parseAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Number(amount.toFixed(2)) : null;
};

const formatAdjustment = (adjustment) => ({
  ...adjustment,
  manufacturerName: adjustment.manufacturer?.companyName || adjustment.manufacturer?.fullName || 'Manufacturer',
  manufacturerEmail: adjustment.manufacturer?.email || null,
  amount: Number(adjustment.amount.toFixed(2))
});

export const getManufacturerAdjustments = async (req, res) => {
  try {
    if (!isManufacturer(req.user?.role) && !isAdmin(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Only manufacturers and administrators can view adjustments' });
    }

    const where = isManufacturer(req.user?.role) ? { manufacturerId: req.user.id } : {};
    const adjustments = await prisma.manufacturerAdjustment.findMany({
      where,
      include: { manufacturer: { select: { fullName: true, companyName: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(adjustments.map(formatAdjustment));
  } catch (error) {
    console.error('Error fetching manufacturer adjustments:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch manufacturer adjustments' });
  }
};

export const createManufacturerAdjustment = async (req, res) => {
  try {
    if (!isManufacturer(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Only manufacturers can submit adjustments' });
    }

    const amount = parseAmount(req.body?.amount);
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    if (!amount || !reason) {
      return res.status(400).json({ success: false, message: 'A positive amount and reason are required' });
    }

    const adjustment = await prisma.manufacturerAdjustment.create({
      data: { manufacturerId: req.user.id, amount, reason },
      include: { manufacturer: { select: { fullName: true, companyName: true, email: true } } }
    });
    return res.status(201).json({ success: true, data: formatAdjustment(adjustment) });
  } catch (error) {
    console.error('Error creating manufacturer adjustment:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to submit manufacturer adjustment' });
  }
};

export const respondToManufacturerAdjustment = async (req, res) => {
  try {
    if (!isAdmin(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Only administrators can review adjustments' });
    }
    const action = String(req.body?.action || '').toUpperCase();
    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be APPROVE or REJECT' });
    }

    const adjustment = await prisma.manufacturerAdjustment.findUnique({ where: { id: req.params.id } });
    if (!adjustment) return res.status(404).json({ success: false, message: 'Adjustment not found' });
    if (adjustment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Only pending adjustments can be reviewed' });
    }

    const updated = await prisma.manufacturerAdjustment.update({
      where: { id: adjustment.id },
      data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED', reviewedAt: new Date() },
      include: { manufacturer: { select: { fullName: true, companyName: true, email: true } } }
    });
    return res.json({ success: true, data: formatAdjustment(updated) });
  } catch (error) {
    console.error('Error reviewing manufacturer adjustment:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to review manufacturer adjustment' });
  }
};

export const payManufacturerAdjustment = async (req, res) => {
  try {
    if (!isAdmin(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Only administrators can pay adjustments' });
    }
    const adjustment = await prisma.manufacturerAdjustment.findUnique({ where: { id: req.params.id } });
    if (!adjustment) return res.status(404).json({ success: false, message: 'Adjustment not found' });
    if (adjustment.status !== 'APPROVED') return res.status(400).json({ success: false, message: 'Only approved adjustments can be paid' });
    if (adjustment.paymentStatus === 'PAID') return res.status(400).json({ success: false, message: 'Adjustment is already paid' });

    const result = await prisma.manufacturerAdjustment.updateMany({
      where: { id: adjustment.id, status: 'APPROVED', paymentStatus: 'UNPAID' },
      data: { paymentStatus: 'PAID', paidAt: new Date() }
    });
    if (!result.count) return res.status(400).json({ success: false, message: 'Adjustment was already paid' });
    return res.json({ success: true, message: 'Adjustment marked as paid' });
  } catch (error) {
    console.error('Error paying manufacturer adjustment:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to pay manufacturer adjustment' });
  }
};
