/**
 * StatusTransitions
 * -----------------
 * Lookup-table that maps paper "status" and user "role" to:
 *  - label: Button/action label to show in UI (e.g. Approve, Lock)
 *  - update: Function that takes the paper and returns the status/state update object
 *  - confirm: Function that returns the confirmation string for the checkbox
 *
 * Used by ApprovePaper and role-specific approval screens.
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
