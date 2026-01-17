const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

// ===========================================
// AUTHENTICATION TRIGGERS
// ===========================================

/**
 * Automatically assign default "user" role on signup
 */
exports.setDefaultUserRoleOnSignup = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;

    try {
        // Set custom claim
        await auth.setCustomUserClaims(uid, { role: 'user' });

        // Create user document with default profile
        await db.collection('users').doc(uid).set({
            uid,
            email,
            role: 'user',
            isProfileComplete: false,
            approvalStatus: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`User ${uid} created with default role: user`);
        return { success: true };
    } catch (error) {
        console.error('Error setting default role:', error);
        throw error;
    }
});

/**
 * Validate profile completion on user document update
 */
exports.validateProfileCompletion = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();

        // Only validate if isProfileComplete changed to true
        if (newData.isProfileComplete && !previousData.isProfileComplete) {
            const requiredFields = ['name', 'gender', 'age', 'photos'];
            const missingFields = requiredFields.filter(field => !newData[field]);

            // Validate minimum photos
            if (!newData.photos || newData.photos.length < 4) {
                console.warn(`Profile ${context.params.userId} marked complete but has < 4 photos`);
                // Note: In production, you might want to revert isProfileComplete
            }

            if (missingFields.length > 0) {
                console.warn(`Profile ${context.params.userId} missing fields: ${missingFields.join(', ')}`);
            }

            console.log(`Profile ${context.params.userId} marked complete`);
        }

        return null;
    });

// ===========================================
// ADMIN FUNCTIONS
// ===========================================

async function verifyAdminRole(context, requiredRole) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const role = context.auth.token.role;

    if (!role) {
        throw new functions.https.HttpsError('permission-denied', 'No admin role found.');
    }

    if (requiredRole === 'primary_admin' && role !== 'primary_admin') {
        throw new functions.https.HttpsError('permission-denied', 'Requires Primary Admin role.');
    }

    return context.auth.uid;
}

async function logAdminAction(adminId, actionType, targetId, metadata = {}) {
    const logEntry = {
        adminId,
        actionType,
        targetId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata
    };
    await db.collection('adminLogs').add(logEntry);
}

/**
 * Set admin role (callable function)
 * Only super_admin or primary_admin can call this
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'primary_admin');
    const { targetUserId, role } = data;

    if (!targetUserId || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing targetUserId or role.');
    }

    const validRoles = ['user', 'admin', 'primary_admin', 'super_admin'];
    if (!validRoles.includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role.');
    }

    try {
        // Set Custom Claims
        await auth.setCustomUserClaims(targetUserId, { role });

        // Update Firestore user document
        await db.collection('users').doc(targetUserId).update({
            role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // If admin role, create admin metadata
        if (role === 'admin' || role === 'primary_admin' || role === 'super_admin') {
            await db.collection('admins').doc(targetUserId).set({
                uid: targetUserId,
                role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: callerUid,
                isActive: true
            });
        }

        // Log action
        await logAdminAction(callerUid, 'SET_ADMIN_ROLE', targetUserId, { role });

        return { success: true, message: `Role ${role} assigned to ${targetUserId}` };
    } catch (error) {
        console.error('Error setting admin role:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Revoke admin role
 */
exports.revokeAdminRole = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'primary_admin');
    const { targetUserId } = data;

    if (!targetUserId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing targetUserId.');
    }

    try {
        // Set to default user role
        await auth.setCustomUserClaims(targetUserId, { role: 'user' });

        // Update Firestore
        await db.collection('users').doc(targetUserId).update({
            role: 'user',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Deactivate admin metadata
        await db.collection('admins').doc(targetUserId).update({
            isActive: false,
            revokedAt: admin.firestore.FieldValue.serverTimestamp(),
            revokedBy: callerUid
        });

        // Log
        await logAdminAction(callerUid, 'REVOKE_ADMIN_ROLE', targetUserId);

        return { success: true };
    } catch (error) {
        console.error('Error revoking admin role:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Approve User Profile
 */
exports.approveUserProfile = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'any');
    const { userId } = data;

    await db.collection('users').doc(userId).update({
        approvalStatus: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: callerUid
    });

    await logAdminAction(callerUid, 'APPROVE_USER', userId);
    return { success: true };
});

/**
 * Reject User Profile
 */
exports.rejectUserProfile = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'any');
    const { userId, reason } = data;

    await db.collection('users').doc(userId).update({
        approvalStatus: 'rejected',
        rejectionReason: reason,
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectedBy: callerUid
    });

    await logAdminAction(callerUid, 'REJECT_USER', userId, { reason });
    return { success: true };
});

/**
 * Suspend User
 */
exports.suspendUser = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'any');
    const { userId, duration } = data;

    await db.collection('users').doc(userId).update({
        isSuspended: true,
        suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
        suspendedBy: callerUid,
        suspensionDuration: duration
    });

    await logAdminAction(callerUid, 'SUSPEND_USER', userId, { duration });
    return { success: true };
});

/**
 * Admin audit logger (callable for manual logging)
 */
exports.adminAuditLogger = functions.https.onCall(async (data, context) => {
    const callerUid = await verifyAdminRole(context, 'any');
    const { actionType, targetId, metadata } = data;

    if (!actionType || !targetId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing actionType or targetId.');
    }

    await logAdminAction(callerUid, actionType, targetId, metadata || {});
    return { success: true, logged: true };
});
