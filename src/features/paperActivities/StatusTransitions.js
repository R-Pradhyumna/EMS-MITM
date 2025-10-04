/**
 * Paper Status Transition Configuration
 *
 * Lookup table defining paper approval workflow transitions based on current status
 * and user role. Provides role-specific action labels, status updates, and confirmation
 * messages for the multi-stage paper approval process.
 *
 * Workflow stages:
 * 1. Faculty submits → Status: "Submitted"
 * 2. CoE approves → Status: "CoE-approved"
 * 3. BoE scrutinizes and approves → Status: "BoE-approved"
 * 4. CoE locks → Status: "Locked" (final, ready for Principal)
 *
 * @module StatusTransitions
 */

/**
 * Status transition configuration object.
 *
 * Maps each paper status to role-specific actions that can be performed.
 * Each transition defines:
 * - label: Button text shown in UI
 * - update: Function returning status update object
 * - confirm: Function returning confirmation message for checkbox (optional)
 *
 * Usage:
 *   const transition = StatusTransitions[paper.status]?.[userRole];
 *   if (transition) {
 *     const buttonLabel = transition.label;
 *     const updateData = transition.update(paper);
 *     const confirmMsg = transition.confirm?.(paper);
 *   }
 *
 * Transition structure:
 * {
 *   [paperStatus]: {
 *     [userRole]: {
 *       label: string,
 *       update: (paper) => object,
 *       confirm: (paper) => string (optional)
 *     }
 *   }
 * }
 *
 * @type {Object.<string, Object.<string, {label: string, update: Function, confirm: (Function|undefined)}>>}
 *
 * @property {Object} Submitted - Transitions available when paper status is "Submitted"
 * @property {Object} Submitted.CoE - CoE actions for submitted papers
 * @property {string} Submitted.CoE.label - Button label: "Approve"
 * @property {Function} Submitted.CoE.update - Returns {status: "CoE-approved"}
 * @property {Function} Submitted.CoE.confirm - Returns confirmation message with uploader info
 *
 * @property {Object} CoE-approved - Transitions available when paper status is "CoE-approved"
 * @property {Object} CoE-approved.BoE - BoE actions for CoE-approved papers
 * @property {string} CoE-approved.BoE.label - Button label: "Approve"
 * @property {Function} CoE-approved.BoE.update - Returns {status: "BoE-approved"}
 *
 * @property {Object} BoE-approved - Transitions available when paper status is "BoE-approved"
 * @property {Object} BoE-approved.CoE - CoE actions for BoE-approved papers (final step)
 * @property {string} BoE-approved.CoE.label - Button label: "Lock"
 * @property {Function} BoE-approved.CoE.update - Returns {status: "Locked", is_locked: true}
 * @property {Function} BoE-approved.CoE.confirm - Returns confirmation message with approver info
 */

const StatusTransitions = {
  // When status is "Submitted"
  Submitted: {
    CoE: {
      label: "Approve", // Action button will read: "Approve paper #"
      update: (paper) => ({ status: "CoE-approved" }), // Sets new status
      confirm: (paper) =>
        `I confirm that ${paper.uploaded_by} has uploaded paper #${paper.id}`,
    },
  },
  // When status is "CoE-approved"
  "CoE-approved": {
    BoE: {
      label: "Approve", // BoE now approves
      update: (paper) => ({ status: "BoE-approved" }), // Sets next status
    },
  },
  // When status is "BoE-approved"
  "BoE-approved": {
    CoE: {
      label: "Lock", // Final approval step: Lock the paper
      update: (paper) => ({ status: "Locked", is_locked: true }),
      confirm: (paper) =>
        `I confirm that ${paper.approved_by || paper.uploaded_by} 
           has approved paper #${paper.id}`,
    },
  },
};

export default StatusTransitions;
