import User from '../models/User.js';
import Counter from '../models/Counter.js';
import KafkaAdapter from '../messaging/KafkaAdapter.js';

// Generate an auto-increment userId like: 100001, 100002, or with prefix if needed
async function getNextUserId() {
  const counter = await Counter.findByIdAndUpdate(
    'userId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  // return as string with an example format
  return String(counter.seq);
}

// Create user
export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate nested required fields for create
    if (!req.body.address || !req.body.address.address) {
      return res.status(400).json({ error: 'address.address is required' });
    }
    if ((!req.body.phone || !req.body.phone.phoneNumber) && req.body.phone.phoneNumber != 0) {
      return res.status(400).json({ error: 'phone.phoneNumber is required' });
    }

    // Business rule: name and email must be unique among non-deleted users
    const existing = await User.findOne({ $or: [{ name }, { email }], deleted: false });
    if (existing) return res.status(409).json({ error: 'name or email already in use by an active user' });

    // Generate userId
    const nextId = await getNextUserId();
    const userId = nextId;

  const user = new User({ ...req.body, userId });
  await user.save();
  // Emit event
  KafkaAdapter.sendEvent(user.userId, 'Customer.Created', user);
  res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update user (partial)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // id here is userId
    const updates = req.body;

    // Prevent recreating a logically deleted user: if target user is deleted, forbid update
    const user = await User.findOne({ userId: id });
    if (!user || user.deleted) return res.status(404).json({ error: 'user not found or deleted' });

    // If name or email are being changed, ensure uniqueness among non-deleted users
    if (updates.name || updates.email) {
      const conflict = await User.findOne({
        $or: [
          updates.name ? { name: updates.name } : null,
          updates.email ? { email: updates.email } : null
        ].filter(Boolean),
        deleted: false,
        userId: { $ne: id }
      });
      if (conflict) return res.status(409).json({ error: 'name or email already in use by an active user' });
    }

    // Merge nested address and phone instead of replacing (so only provided fields are updated)
    if (updates.address) {
      user.address = Object.assign({}, user.address || {}, updates.address);
      delete updates.address;
    }
    if (updates.phone) {
      user.phone = Object.assign({}, user.phone || {}, updates.phone);
      delete updates.phone;
    }

    Object.assign(user, updates);
    await user.save();
    KafkaAdapter.sendEvent(user.userId, 'Customer.Updated', { userId: user.userId, ...req.body });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user || user.deleted) return res.status(404).json({ error: 'user not found or deleted' });
  user.suspended = true;
  await user.save();
  KafkaAdapter.sendEvent(user.userId, 'Customer.Suspended', { userId: user.userId });
  res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reactivate user (unsuspend)
export const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user || user.deleted) return res.status(404).json({ error: 'user not found or deleted' });
  user.suspended = false;
  await user.save();
  KafkaAdapter.sendEvent(user.userId, 'Customer.Reactivated', { userId: user.userId });
  res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Logical delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user || user.deleted) return res.status(404).json({ error: 'user not found or already deleted' });
  user.deleted = true;
  await user.save();
  KafkaAdapter.sendEvent(user.userId, 'Customer.Deleted', { userId: user.userId });
  res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users with simple search (by name or email) and pagination
export const getAllUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const base = { deleted: false };
    if (q) {
      base.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    const users = await User.find(base).skip(skip).limit(Number(limit));
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user by userId
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ email: id, deleted: false });
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
