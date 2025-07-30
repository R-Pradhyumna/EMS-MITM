const StatusTransitions = {
  Submitted: {
    coe: {
      label: "Approve",
      update: (paper) => ({ status: "CoE-approved" }),
      confirm: (paper) =>
        `I confirm that ${paper.uploaded_by} has uploaded paper #${paper.id}`,
    },
  },
  "CoE-approved": {
    boe: {
      label: "Approve",
      update: (paper) => ({ status: "BoE-approved" }),
      confirm: (paper) =>
        `I confirm that ${
          paper.approved_by || paper.uploaded_by
        } has approved paper #${paper.id}`,
    },
  },
  "BoE-approved": {
    coe: {
      label: "Lock",
      update: (paper) => ({ status: "Locked", is_locked: true }),
      confirm: (paper) =>
        `I confirm all approvals are complete for paper #${paper.id}. Locking now.`,
    },
  },
};

export default StatusTransitions;
