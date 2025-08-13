import supabase from "./supabase";

export async function signUp({
  fullName,
  email,
  password,
  employee_id,
  department_name,
  role,
}) {
  // Save the current session before signing up a new user
  const { data: savedSessionData } = await supabase.auth.getSession();
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
      },
    },
  });
  //If there was a previously authenticated user, restore their session
  // This action should be placed right after signUp, otherwise the authError will stop the restore
  if (savedSessionData) {
    await supabase.auth.setSession(savedSessionData.session);
  }
  // Handle errors
  let authError = null;
  if (user && !user.identities.length) {
    authError = {
      name: "AuthApiError",
      message: "This email has already been registered",
    };
  } else if (error) {
    authError = {
      name: error.name,
      message: error.message,
    };
  }
  if (authError) throw new Error(authError.message);

  // ---- INSERT into custom users table ----
  // Only proceed if user registration succeeded
  const { error: dbError } = await supabase.from("users").insert([
    {
      employee_id, // Needs to come from form
      username: fullName,
      auth_user_id: user.id,
      department_name, // Needs to come from form
      role,
    },
  ]);
  if (dbError) throw dbError;

  return user;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return data?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}

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

// Fetch role for the currently authenticated user
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
