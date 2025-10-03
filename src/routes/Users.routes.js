import express from 'express';
const router = express.Router();
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    suspendUser,
    reactivateUser,
    deleteUser,
} from '../controllers/Users.controller.js';

// Create user
router.post('/', createUser);

// Get all users with optional search
router.get('/', getAllUsers);

// Get user by userId
router.get('/:id', getUserById);

// Update user (partial)
router.put('/:id', updateUser);

// Suspend user
router.post('/:id/suspend', suspendUser);

// Reactivate user
router.post('/:id/reactivate', reactivateUser);

// Logical delete
router.delete('/:id', deleteUser);

export default router;
