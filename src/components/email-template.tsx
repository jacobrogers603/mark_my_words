import * as React from "react";

interface EmailTemplateProps {
  email: string;
  resetCode: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  email,
  resetCode,
}) => (
    <main style={{ whiteSpace: "pre-wrap", fontFamily: "Arial, sans-serif" }}>
  <h1 style={{ fontSize: "18px", fontWeight: "bold" }}>
    Greetings, {email}, from Mark My Words!
  </h1>

  <p>You have requested a password reset.</p>

  <p style={{ whiteSpace: "pre-wrap", fontFamily: "Arial, sans-serif" }}>
    <span style={{ fontWeight: "bold", fontSize: "20px", color: "red" }}>
      Your reset code is: {resetCode}
    </span>
    <br />
    <br />
    Go to:
    <br />
    <a 
      href="https://mark-my-words.net/reset" 
      style={{
        display: "inline-block",
        padding: "10px 20px",
        margin: "10px 0",
        backgroundColor: "#007bff",
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: "5px",
        textAlign: "center"
      }}
    >
      Reset Your Password
    </a>
    <br />
    to enter the code and reset your password. 
    <br />
    <br />
    If you did not request a password reset, please ignore this email.
    <br />
    <br />
    <footer style={{ whiteSpace: "pre-wrap", fontFamily: "Arial, sans-serif" }}>
      Best regards,
      <br />
      &nbsp;&nbsp;Mark My Words Creator,
      <br />
      &nbsp;&nbsp;Jacob Rogers
    </footer>
  </p>
</main>
);
