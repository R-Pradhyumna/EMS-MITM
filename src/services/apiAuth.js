/**
 * Authentication API Module
 *
 * Handles all authentication-related operations including login, logout,
 * user session management, and user data retrieval for the ExamSuite application.
 * Integrates with Supabase Auth and the custom users table.
 *
 * @module apiAuth
 */

import supabase from "./supabase";

/**
 * Authenticates a user with email and password.
 *
 * Performs multi-step authentication:
 * 1. Authenticates credentials with Supabase Auth
 * 2. Fetches user record from the business users table
 * 3. Validates user account status (checks for soft-deletion)
 * 4. Auto-logs out if account is deactivated
 *
 * @async
 * @param {Object} credentials
 *@param {string} credentials.email - User's email address
 *@param {string} credentials.password - User's password
 * @returns {Promise<Object>} Authentication data including user and session information
 * @throws {Error} If authentication fails, user data not found, or account is deactivated
 *
 * @example
 * const authData = await login({
 *   email: 'faculty@example.com',
 *   password: 'securepassword'
 * });
 *
 * @example
 * // Handle authentication errors
 * try {
 *   const data = await login({ email, password });
 *   console.log('Logged in as:', data.user.email);
 * } catch (error) {
 *   if (error.message.includes('deactivated')) {
 *     console.error('Account is deactivated');
 *   }
 * }
 */
export async function login({ email, password }) {
  // 1. Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Exit early on authentication error
  if (error) throw new Error(error.message);

  // 2. Fetch user from your business table
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", data.user.id)
    .single();

  // Handle missing user record (very unlikely unless your data is corrupted)
  if (userError || !user) throw new Error("Account data not found.");

  // 3. If user is soft-deleted, log out immediately and block access
  if (user.deleted_at) {
    await supabase.auth.signOut();
    throw new Error("Your account has been deactivated.");
  }

  // 4. User is active and not soft-deleted; proceed to app
  return data;
}

/**
 * Retrieves the currently authenticated user from the active session.
 *
 * Checks for an active session and returns the authenticated user object.
 * Returns null if no active session exists.
 *
 * @async
 * @returns {Promise<Object|null>} Supabase auth user object if authenticated, null otherwise
 * @throws {Error} If there's an error retrieving user data
 *
 * @example
 * const currentUser = await getCurrentUser();
 * if (currentUser) {
 *   console.log('User is logged in:', currentUser.email);
 * } else {
 *   console.log('No active session');
 * }
 *
 * @example
 * // Use in authentication guard
 * const user = await getCurrentUser();
 * if (!user) {
 *   navigate('/login');
 * }
 */
export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return data?.user;
}

/**
 * Logs out the currently authenticated user.
 *
 * Terminates the user's session and clears authentication tokens.
 * This will trigger a redirect to the login page in most application setups.
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If logout operation fails
 *
 * @example
 * await logout();
 * // User is now logged out and redirected to login page
 *
 * @example
 * // With error handling
 * try {
 *   await logout();
 *   console.log('Logout successful');
 * } catch (error) {
 *   console.error('Logout failed:', error.message);
 * }
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}

/**
 * Updates the current user's profile information.
 *
 * Allows updating either the user's password or full name.
 * Only the provided fields will be updated. At least one field must be provided.
 *
 * @async
 * @param {Object} updates - Fields to update
 * @param {string} [updates.password] - New password (optional, min 6 characters)
 * @param {string} [updates.fullName] - New full name (optional)
 * @returns {Promise<Object>} Updated Supabase auth user data
 * @throws {Error} If update operation fails
 *
 * @example
 * // Update password only
 * await updateCurrentUser({ password: 'newSecurePassword123' });
 *
 * @example
 * // Update full name only
 * await updateCurrentUser({ fullName: 'Dr. John Smith' });
 *
 * @example
 * // Update both fields
 * await updateCurrentUser({
 *   password: 'newPassword123',
 *   fullName: 'Dr. Jane Doe'
 * });
 */
export async function updateCurrentUser({ password, fullName }) {
  let updateData;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } };

  const { data: updatedData, error } = await supabase.auth.updateUser(
    updateData
  );

  if (error) throw new Error(error.message);
  return updatedData;
}

/**
 * Fetches complete business data for the currently authenticated user.
 *
 * Retrieves user-specific information from the custom users table including
 * employee ID, username, role, and department. This data is used throughout
 * the application for role-based access control and personalization.
 *
 * @async
 * @returns {Promise<Object>} User business data
 * @returns {string} returns.employee_id - User's employee identifier
 * @returns {string} returns.username - User's display name
 * @returns {string} returns.department_name - User's department name
 * @returns {('Faculty'|'BoE'|'CoE'|'Principal')} returns.role returns.role - User's role (Faculty, CoE, BoE, Principal)
 * @throws {Error} If no authenticated user found or user data doesn't exist in database
 *
 * @example
 * const userData = await fetchUserData();
 * console.log(`Role: ${userData.role}, Department: ${userData.department_name}`);
 *
 * @example
 * // Use for role-based routing
 * const { role } = await fetchUserData();
 * if (role === 'Faculty') {
 *   navigate('/faculty/dashboard');
 * } else if (role === 'CoE') {
 *   navigate('/coe/dashboard');
 * }
 *
 * @example
 * // Get employee information
 * const userData = await fetchUserData();
 * const greeting = `Welcome, ${userData.username}!`;
 * console.log(greeting);
 */
export async function fetchUserData() {
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) throw new Error("No authenticated user found!");

  const { data, error } = await supabase
    .from("users")
    .select("employee_id,username,role,department_name")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !data) throw new Error("User role not found in database!");

  return {
    employee_id: data.employee_id,
    username: data.username,
    department_name: data.department_name,
    role: data.role,
  };
}
