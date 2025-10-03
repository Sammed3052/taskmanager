import React, { useState } from "react";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP sent to your email");
        setStep(2);
      } else {
        setMessage(data.error || "❌ Email not found");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Try again later.");
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      // Verify OTP first
      const verifyRes = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setMessage(verifyData.error || "❌ Invalid OTP or expired");
        return;
      }

      // OTP verified, now reset password
      const resetRes = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const resetData = await resetRes.json();

      if (resetRes.ok) {
        setMessage("✅ Password reset successfully! You can now log in.");
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        setMessage(resetData.error || "❌ Something went wrong while resetting password");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Try again later.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-4 text-primary">Forgot Password</h2>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label className="form-label">Enter your email</label>
              <input
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your registered email"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-control"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" className="btn btn-success w-100">Reset Password</button>
          </form>
        )}

        {message && <p className="mt-3 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
