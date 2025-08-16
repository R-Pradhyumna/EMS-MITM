import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

const GlobalStyles = lazy(() => import("./styles/GlobalStyles"));
const ProtectedRoute = lazy(() => import("./ui/ProtectedRoute"));
const AppLayout = lazy(() => import("./ui/AppLayout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const Faculty = lazy(() => import("./pages/Faculty"));
const CoE = lazy(() => import("./pages/CoE"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BoE = lazy(() => import("./pages/BoE"));
const Principal = lazy(() => import("./pages/Principal"));
const Paper = lazy(() => import("./pages/Paper"));
const Approve = lazy(() => import("./pages/Approve"));
const Users = lazy(() => import("./pages/Users"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

import { DarkModeProvider } from "./context/DarkModeContext";
import Spinner from "./ui/Spinner";

const queryClient = new QueryClient();

function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <GlobalStyles />
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
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
          </Suspense>
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
