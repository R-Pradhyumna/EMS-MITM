import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import GlobalStyles from "./styles/GlobalStyles";
import HomePage from "./pages/HomePage";
import Faculty from "./pages/Faculty";
import CoE from "./pages/CoE";
import BoE from "./pages/BoE";
import Principal from "./pages/Principal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Users from "./pages/Users";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./ui/AppLayout";
import Paper from "./pages/Paper";
import Approve from "./pages/Approve";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ui/ProtectedRoute";
import Account from "./pages/Account";
import { DarkModeProvider } from "./context/DarkModeContext";

const queryClient = new QueryClient();

function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <GlobalStyles />
        <BrowserRouter>
          <Routes>
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate replace to="homepage" />} />

              <Route path="homepage" element={<HomePage />} />

              <Route
                path="faculty"
                element={
                  <ProtectedRoute allowedRoles={["faculty"]}>
                    <Faculty />
                  </ProtectedRoute>
                }
              />

              <Route
                path="coe"
                element={
                  <ProtectedRoute allowedRoles={["CoE"]}>
                    <CoE />
                  </ProtectedRoute>
                }
              />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={["CoE"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="boe"
                element={
                  <ProtectedRoute allowedRoles={["BoE"]}>
                    <BoE />
                  </ProtectedRoute>
                }
              />

              <Route path="papers/:id" element={<Paper />} />

              <Route
                path="approve/:id"
                allowedRoles={["CoE", "BoE"]}
                element={
                  <ProtectedRoute allowedRoles={["CoE", "BoE"]}>
                    <Approve />
                  </ProtectedRoute>
                }
              />

              <Route
                path="principal"
                element={
                  <ProtectedRoute allowedRoles={["Principal"]}>
                    <Principal />
                  </ProtectedRoute>
                }
              />

              <Route path="users" element={<Users />} />

              <Route path="account" element={<Account />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000, //3 seconds
            },
            error: {
              duration: 5000, //5 seconds
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              backgroundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
