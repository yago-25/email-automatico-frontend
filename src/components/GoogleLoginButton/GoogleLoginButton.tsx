import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleLoginButton = () => {
  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "SEU_CLIENT_ID",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-login-btn"),
      {
        theme: "outline",
        size: "large",
        type: "standard",
      }
    );
  }, []);

  const handleCredentialResponse = (response: any) => {
    const { loginWithGoogle } = useAuth();
    const googleJwt = response.credential;
    loginWithGoogle(googleJwt);
  };

  return <div id="google-login-btn" />;
};
