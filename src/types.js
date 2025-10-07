/**
 * ExamSuite Type Definitions
 *
 * Central type definitions for the entire application.
 * Import these types anywhere in your JSDoc comments using:
 *
 * @module types
 */

/**
 * @typedef {Object} ExamPaper
 * @property {string} id - Unique paper identifier (UUID)
 * @property {string} subject_code - Subject code (e.g., "CS501")
 * @property {string} subject_name - Full subject name
 * @property {string} academic_year - Academic year (e.g., "2024")
 * @property {string} semester - Semester number or name
 * @property {PaperStatus} status - Current paper status
 * @property {string} department_name - Department name
 * @property {string} uploaded_by - Employee ID of uploader
 * @property {string} qp_file_url - Question paper file URL
 * @property {string} scheme_file_url - Scheme of valuation file URL
 * @property {string} [qp_file_type] - MIME type of QP file
 * @property {string} [scheme_file_type] - MIME type of Scheme file
 * @property {string} [storage_folder_path] - Storage path in bucket
 * @property {string} [approved_by] - Employee ID of approver (optional)
 * @property {string} [exam_name] - Name of the exam (e.g., "Mid Term", "End Sem")
 * @property {boolean} [is_locked] - Whether paper is locked
 * @property {boolean} [is_downloaded] - Whether paper has been downloaded
 * @property {string} [exam_datetime] - ISO timestamp of exam schedule
 * @property {string} created_at - ISO timestamp of creation
 * @property {string} [updated_at] - ISO timestamp of last update
 * @property {string} [downloaded_at] - ISO timestamp of download
 * @property {number} [exam_id] - Related exam ID (foreign key)
 * @property {number} [subject_id] - Related subject ID (foreign key)
 * @property {number} [department_id] - Related department ID (foreign key)
 */

/**
 * Paper status enum
 * @typedef {('Submitted'|'CoE-approved'|'BoE-approved'|'Locked'|'Downloaded')} PaperStatus
 */

/**
 * @typedef {Object} User
 * @property {string} employee_id - Unique employee identifier
 * @property {string} username - Display name
 * @property {string} email - Email address (from auth.users)
 * @property {string} department_name - Department name
 * @property {UserRole} role - User role
 * @property {string} auth_user_id - Supabase auth user ID (UUID)
 * @property {number} [department_id] - Department ID (foreign key)
 * @property {string} [created_at] - ISO timestamp of account creation
 * @property {string} [deleted_at] - ISO timestamp of soft deletion (if deleted)
 */

/**
 * User role enum
 * @typedef {('Faculty'|'BoE'|'CoE'|'Principal')} UserRole
 */

/**
 * @typedef {Object} Subject
 * @property {number} subject_id - Unique subject identifier
 * @property {string} subject_code - Subject code (e.g., "CS501")
 * @property {string} subject_name - Full subject name
 * @property {string} semester - Semester value
 * @property {string} subject_type - Type of subject (default: "departmental")
 * @property {number} academic_year - Academic year
 * @property {string} [department_name] - Department name
 * @property {number} [department_id] - Associated department ID
 * @property {string} [instructions_url] - Instructions document URL
 * @property {string} [syllabus_url] - Syllabus document URL
 * @property {string} [model_paper_url] - Model paper URL
 * @property {string} [declaration_url] - Declaration form URL
 * @property {string} [templates_url] - Templates URL
 */

/**
 * @typedef {Object} Department
 * @property {number} id - Department ID
 * @property {string} name - Department name (unique)
 */

/**
 * @typedef {Object} Exam
 * @property {number} exam_id - Unique exam identifier
 * @property {string} exam_name - Exam name (e.g., "Mid Term", "End Semester")
 * @property {number} department_id - Associated department ID
 * @property {string} semester - Semester value
 * @property {string} scheme - Exam scheme
 * @property {string} exam_datetime - ISO timestamp of exam schedule
 * @property {number} [subject_id] - Associated subject ID
 * @property {number} [academic_year] - Academic year
 * @property {string} [department_name] - Department name
 * @property {string} [subject_name] - Subject name
 * @property {string} [created_at] - ISO timestamp of creation
 */

/**
 * @typedef {Object} SubjectAssignment
 * @property {string} assignment_id - Unique assignment identifier (UUID)
 * @property {number} subject_id - Related subject ID
 * @property {string} faculty_id - Employee ID of assigned faculty
 * @property {string} token - Unique assignment token
 * @property {string} token_expiry - ISO timestamp of token expiration
 * @property {AssignmentStatus} status - Assignment status
 * @property {number} [extension_count] - Number of deadline extensions
 * @property {string} [extended_deadline] - ISO timestamp of extended deadline
 * @property {string} [last_reminder_sent] - ISO timestamp of last reminder
 * @property {string} [created_at] - ISO timestamp of creation
 * @property {string} [updated_at] - ISO timestamp of last update
 */

/**
 * Assignment status enum
 * @typedef {('pending'|'notified'|'submitted'|'expired'|'extended')} AssignmentStatus
 */

/**
 * @typedef {Object} PrincipalDownload
 * @property {string} principal_employee_id - Principal's employee ID
 * @property {number} subject_id - Downloaded subject ID
 * @property {string} exam_date - Date of exam (YYYY-MM-DD)
 * @property {string} downloaded_paper_id - ID of downloaded paper
 * @property {string} subject_code - Subject code
 * @property {string} qp_file_url - Question paper file URL
 * @property {string} downloaded_at - ISO timestamp of download
 */

/**
 * Generic paginated response wrapper
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {T[]} data - Array of items
 * @property {number} count - Total count of items
 */

/**
 * @typedef {Object} Filter
 * @property {string} field - Field name to filter on
 * @property {string|number|boolean} value - Filter value
 */

/**
 * @typedef {Object} QueryOptions
 * @property {number} [page] - Current page number (1-indexed)
 * @property {Filter[]} [filters] - Array of filters
 * @property {string} [search] - Search query string
 * @property {string} [sortBy] - Field to sort by
 * @property {('asc'|'desc')} [sortOrder] - Sort order
 * @property {string} [date] - Date filter (YYYY-MM-DD format)
 * @property {string} [employee_id] - Employee ID filter
 * @property {string} [department_name] - Department name filter
 */

/**
 * @typedef {Object} MutationCallbacks
 * @property {Function} [onSuccess] - Called on successful mutation
 * @property {Function} [onError] - Called on mutation error
 * @property {Function} [onSettled] - Called after mutation completes (success or error)
 */

/**
 * @typedef {Object} StatusTransition
 * @property {string} label - Button/action label for UI
 * @property {Function} update - Function returning status update object
 * @property {Function} [confirm] - Optional confirmation message function
 */

/**
 * @typedef {Object} UploadPayload
 * @property {ExamPaper} paper - Paper metadata
 * @property {File|File[]} qp_file - Question paper file(s)
 * @property {File|File[]} scheme_file - Scheme of valuation file(s)
 */

/**
 * @typedef {Object} SubjectGroup
 * @property {string} subject_code - Subject code
 * @property {string} subject_name - Subject name
 * @property {string} academic_year - Academic year
 * @property {string} semester - Semester
 * @property {Array<ExamPaper|null>} papers - Array of papers (fixed length, padded with null)
 * @property {boolean} downloaded - Whether subject has been downloaded
 */

/**
 * @typedef {Object} AuthCredentials
 * @property {string} email - User email address
 * @property {string} password - User password
 */

/**
 * @typedef {Object} SignupData
 * @property {string} fullName - Full name of user
 * @property {string} email - Email address
 * @property {string} password - Password
 * @property {string} employee_id - Employee ID
 * @property {string} department_name - Department name
 * @property {UserRole} role - User role
 */

/**
 * @typedef {Object} SupabaseError
 * @property {string} message - Error message
 * @property {number} [code] - Error code
 * @property {string} [details] - Additional error details
 */

/**
 * React Query hook return type
 * @typedef {Object} QueryResult
 * @template T
 * @property {T|undefined} data - Query data
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error|null} error - Error object
 * @property {boolean} isSuccess - Success state
 * @property {Function} refetch - Function to manually refetch
 */

/**
 * React Query mutation return type
 * @typedef {Object} MutationResult
 * @template T
 * @property {Function} mutate - Mutation trigger function
 * @property {Function} mutateAsync - Async mutation trigger
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {boolean} isSuccess - Success state
 * @property {Error|null} error - Error object
 * @property {T|undefined} data - Mutation result data
 */

// Export as empty object to make this a module
export {};
