"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suspendUser = exports.rejectUserProfile = exports.approveUserProfile = exports.revokeAdminRole = exports.assignAdminRole = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Admin SDK if not already
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const auth = admin.auth();
// --- Helpers ---
async function verifyAdminRole(context, requiredRole) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const { role } = context.auth.token;
    if (!role) {
        throw new functions.https.HttpsError('permission-denied', 'No admin role found.');
    }
    if (requiredRole !== 'any' && role !== requiredRole) {
        // Primary can do secondary tasks? Usually yes, but strict requirement "Only primary admin can Assign roles".
        // Typically RBAC hierarchies imply Primary > Secondary. 
        // But prompt separates them. 
        // For 'assignAdminRole' -> Primary Only. 
        // For 'suspendUser' -> Primary or Secondary. 
        if (requiredRole === 'primary_admin' && role !== 'primary_admin') {
            throw new functions.https.HttpsError('permission-denied', 'Requires Primary Admin role.');
        }
    }
    return context.auth.uid;
}
// Log admin action strictly
async function logAdminAction(adminId, actionType, targetId, metadata = {}) {
    const logEntry = {
        adminId,
        actionType,
        targetId,
        timestamp: Date.now(),
        metadata
    };
    await db.collection('adminLogs').add(logEntry);
}
// --- Exported Functions ---
/**
 * Assigns an admin role to a user.
 * Caller: Primary Admin ONLY.
 */
exports.assignAdminRole = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'primary_admin');
    const { targetUserId, role } = data;
    if (!targetUserId || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing targetUserId or role.');
    }
    if (role !== 'primary_admin' && role !== 'secondary_admin') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role.');
    }
    // 1. Set Custom Claims
    await auth.setCustomUserClaims(targetUserId, { role });
    // 2. Update Firestore Metadata
    const adminData = {
        uid: targetUserId,
        role,
        createdAt: Date.now(),
        createdBy: callerUid,
        isActive: true
    };
    await db.collection('admins').doc(targetUserId).set(adminData);
    // 3. Log
    await logAdminAction(callerUid, 'ASSIGN_ROLE', targetUserId, { role });
    return { success: true };
});
/**
 * Revokes admin role.
 * Caller: Primary Admin ONLY.
 */
exports.revokeAdminRole = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'primary_admin');
    const { targetUserId } = data;
    if (!targetUserId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing targetUserId.');
    }
    // 1. Set Custom Claims to null/empty
    await auth.setCustomUserClaims(targetUserId, null);
    // 2. Update Metadata
    await db.collection('admins').doc(targetUserId).update({ isActive: false });
    // 3. Log
    await logAdminAction(callerUid, 'REVOKE_ROLE', targetUserId);
    return { success: true };
});
/**
 * Approve User Profile.
 * Caller: Primary OR Secondary Admin.
 */
exports.approveUserProfile = functions.https.onCall(async (data, context) => {
    // Primary or Secondary
    const callerUid = await verifyAdminRole(context, 'any');
    const { userId } = data;
    // Business Logic: Update user profile status
    await db.collection('users').doc(userId).update({
        approvalStatus: 'approved',
        approvedAt: Date.now(),
        approvedBy: callerUid
    });
    await logAdminAction(callerUid, 'APPROVE_USER', userId);
    return { success: true };
});
/**
 * Reject User Profile.
 * Caller: Primary OR Secondary Admin.
 */
exports.rejectUserProfile = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'any');
    const { userId, reason } = data;
    await db.collection('users').doc(userId).update({
        approvalStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: Date.now(),
        rejectedBy: callerUid
    });
    await logAdminAction(callerUid, 'REJECT_USER', userId, { reason });
    return { success: true };
});
/**
 * Suspend User.
 * Caller: Primary OR Secondary Admin.
 */
exports.suspendUser = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'any');
    const { userId, duration } = data; // duration in hours maybe? or explicit date
    // In a real app we'd calculate unban date.
    await db.collection('users').doc(userId).update({
        isSuspended: true,
        suspendedAt: Date.now(),
        suspendedBy: callerUid,
        suspensionDuration: duration
    });
    // Also likely Disable Auth?
    // await auth.updateUser(userId, { disabled: true }); 
    await logAdminAction(callerUid, 'SUSPEND_USER', userId, { duration });
    return { success: true };
});
//# sourceMappingURL=index.js.map