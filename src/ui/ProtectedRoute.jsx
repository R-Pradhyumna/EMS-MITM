import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Spinner from "./Spinner";

import { useUser } from "../features/authentication/useUser";
import { useUserData } from "../features/authentication/useUserData";

const FullPage = styled.div`
  height: 100vh;
  background-color: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
`;

function ProtectedRoute({ allowedRoles, children }) {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useUser();
  const { role } = useUserData();

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // RBAC redirect if wrong role
  useEffect(() => {
    if (
      allowedRoles &&
      isAuthenticated &&
      !isLoading &&
      (!role ||
        typeof role !== "string" ||
        !allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase()))
    ) {
      if (typeof role === "string") {
        navigate(`/${role.toLowerCase()}`, { replace: true });
      }
    }
  }, [allowedRoles, user, isAuthenticated, isLoading, navigate]);

  if (isLoading)
    return (
      <FullPage>
        <Spinner />
      </FullPage>
    );

  // Block render until authenticated & authorized
  if (!isAuthenticated) return null;

  if (
    allowedRoles &&
    (!role ||
      typeof role !== "string" ||
      !allowedRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase()))
  ) {
    // not authorized for this portal
    return <FullPage>Not authorized</FullPage>;
  }

  return children;
}

export default ProtectedRoute;
