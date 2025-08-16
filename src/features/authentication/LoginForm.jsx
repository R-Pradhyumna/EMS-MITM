import { useState } from "react";
import styled from "styled-components";

import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRowVertical from "../../ui/FormRowVertical";
import Input from "../../ui/Input";
import SpinnerMini from "./../../ui/SpinnerMini";

import { useLogin } from "./useLogin";

const SignUpLink = styled.a`
  color: var(--color-brand-700);
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: var(--color-brand-500);
  }
`;

function LoginForm() {
  const [email, setEmail] = useState("jojo@example.com");
  const [password, setPassword] = useState("pass0987");
  const { login, isLoading } = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    login(
      { email, password },
      {
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      }
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRowVertical label="Email address">
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </FormRowVertical>

      <FormRowVertical label="Password">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </FormRowVertical>
      <FormRowVertical>
        <Button size="large" disabled={isLoading}>
          {!isLoading ? "Log in" : <SpinnerMini />}
        </Button>
      </FormRowVertical>
      <FormRowVertical>
        <p style={{ textAlign: "center" }}>
          Don't have an account? <SignUpLink href="/signup">Sign up</SignUpLink>
        </p>
      </FormRowVertical>
    </Form>
  );
}

export default LoginForm;
