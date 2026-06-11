import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login_page.css";
import api from "../back_end_url/api_url";
import logoImage from "../../assets/pb_university_logo.png";
import Swal from "sweetalert2";

/* LOGO COMPONENT */
const PBUniversityLogo = () => {
  return (
    <div className="logo">
      <img
        src={logoImage}
        alt="PB University logo"
        className="logo-image"
      />
    </div>
  );
};

/* ILLUSTRATION COMPONENT */
const StudentsIllustration = () => {
  return (
    <img
      src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
      width="200"
      alt="Students illustration"
    />
  );
};

export default function Login_page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [otp, setOtp] = useState(""); // State for OTP
  const [otpSent, setOtpSent] = useState(false); // State for tracking if OTP was sent
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle state
  const [isRegistering, setIsRegistering] = useState(false); // State for registration
  const [registerName, setRegisterName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerOtp, setRegisterOtp] = useState(""); // State for registration OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username/email and password");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await api.get("api/user_master_pagecs_/user_master_log_rightes", {
        params: { um_email_id: username, um_password: password },
      });

      const data = response.data;
      if (data.Status === 1 && data.Result && data.Result.length > 0) {
        const userRecord = data.Result[0];
        localStorage.setItem("token", data.Token);
        localStorage.setItem("user", JSON.stringify(userRecord));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/student_personal_information");
      } else {
        setError("Invalid username/email or password");
      }
    } catch (err) {
      setError("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle sending OTP
  const handleSendOtp = async () => {
    if (!username) {
      setError("Please enter your registered email to receive OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "api/user_master_pagecs_/SendOTP",
        null,
        {
          params: { email_id: username }
        }
      );

      const data = response.data;

      if (data.Status === 1) {
        setOtpSent(true);

        Swal.fire({
          title: "OTP Sent",
          text: "OTP has been sent to your email",
          icon: "success"
        });
      } else {
        setError(data.Message);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle the Password Reset logic
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!username) {
      setError("Please enter your registered email");
      return;
    }
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      setError(""); // Clear main error to focus on inline error
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ STEP 1: VERIFY OTP
      const verifyRes = await api.get(
        "api/user_master_pagecs_/VerifyOTP",
        {
          params: {
            email_id: username,
            otp: otp   // ⚠️ MUST ADD IN BACKEND ALSO
          }
        }
      );

      const verifyData = verifyRes.data;

      if (verifyData.Status !== 1 || verifyData.Result[0].Status !== "1") {
        setError("Invalid or expired OTP");
        setLoading(false);
        return;
      }

      // ✅ STEP 2: UPDATE PASSWORD
      const response = await api.post(
        "api/user_master_pagecs_/forgot_password_update",
        null,
        {
          params: {
            username: username,
            otp: otp,
            new_password: newPassword
          }
        }
      );

      const data = response.data;

      if (data.Status === 1) {
        Swal.fire({
          title: "Success",
          text: "Password updated successfully",
          icon: "success"
        });

        // Reset form
        setIsForgotPassword(false);
        setOtpSent(false);
        setOtp("");
        setNewPassword("");
      } else {
        setError(data.Message);
      }

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle sending OTP for Registration
  const handleSendRegisterOtp = async () => {
    if (!username) {
      setError("First enter email id, then the OTP will send");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "api/user_master_pagecs_/SendOTP_new_user",
        null,
        {
          params: { email_id: username }
        }
      );

      const data = response.data;

      if (data.Status === 1) {
        Swal.fire({
          title: "OTP Sent",
          text: "OTP has been sent to your email",
          icon: "success"
        });
      } else {
        setError(data.Message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username) {
      setError("Please enter your email");
      return;
    }
    if (!registerName) {
      setError("Please enter your full name");
      return;
    }
    if (!registerPassword) {
      setError("Please enter a password");
      return;
    }
    if (registerPassword.length < 6) {
      setError(""); // Clear main error to focus on inline error
      return;
    }
    if (!registerOtp) {
      setError("Please Send the OTP in your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // VERIFY OTP FIRST
      const verifyRes = await api.get(
        "api/user_master_pagecs_/VerifyOTP",
        {
          params: {
            email_id: username,
            otp: registerOtp
          }
        }
      );

      const verifyData = verifyRes.data;

      if (verifyData.Status !== 1 || verifyData.Result[0].Status !== "1") {
        setError("Invalid or expired OTP");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("um_user_name", registerName);
      formData.append("um_email_id", username);
      formData.append("um_password", registerPassword);

      const response = await api.post(
        "api/user_master_pagecs_/user_master_insert_user",
        formData
      );

      const data = response.data;
      if (data.Status === 1) {
        Swal.fire({
          title: "Success",
          text: "User created successfully. You can now login.",
          icon: "success"
        });
        setIsRegistering(false);
        setIsForgotPassword(false);
        setRegisterName("");
        setRegisterPassword("");
        setPassword("");
        setRegisterOtp("");
      } else {
        setError(data.Message || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errorMsg = typeof err.response.data === 'string'
          ? err.response.data
          : (err.response.data.Message || JSON.stringify(err.response.data));
        setError("Error from server: " + errorMsg);
      } else {
        setError("Registration failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <StudentsIllustration />
          <div style={{ textAlign: "center" }}>
            <h3>Distance Learning Programs</h3>
            <p style={{ fontSize: "12px", color: "#777" }}>
              Attend live and recorded classes at your own convenience.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <PBUniversityLogo />
          <h2 className="title">
            {isRegistering ? "Create New User" : isForgotPassword ? "Reset Password" : "Welcome to PB University"}
          </h2>

          {error && (
            <div className="error-message" style={{
              color: "red", fontSize: "14px", marginBottom: "15px",
              padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px", textAlign: "center"
            }}>
              <div>{error}</div>
              {error.toLowerCase().includes("not registered") && !isRegistering && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                  }}
                  style={{
                    marginTop: "10px", padding: "6px 15px", backgroundColor: "#333", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px"
                  }}
                >
                  Create New User
                </button>
              )}
            </div>
          )}

          {/* CONDITIONAL RENDERING BASED ON isRegistering AND isForgotPassword */}
          {isRegistering ? (
            /* REGISTER FORM */
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Enter a password (min 6 characters)"
                  disabled={loading}
                />
                {registerPassword.length > 0 && registerPassword.length < 6 && (
                  <span style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "block" }}>
                    Password must be at least 6 characters long
                  </span>
                )}
              </div>

              {(username && registerName && registerPassword) && (
                <div className="input-group">
                  <label>OTP</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={registerOtp}
                      onChange={(e) => setRegisterOtp(e.target.value)}
                      placeholder="Enter OTP"
                      disabled={loading}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="login-btn"
                      style={{ width: "auto", padding: "0 15px", margin: 0, backgroundColor: "#333", color: "#fff", cursor: "pointer", borderRadius: "20px" }}
                      onClick={handleSendRegisterOtp}
                      disabled={loading || !username}
                    >
                      {loading ? "..." : "Send OTP"}
                    </button>
                  </div>
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
              </button>

              <button
                className="google-btn"
                style={{ marginTop: "10px", backgroundColor: "#fff", color: "#333" }}
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                }}
                type="button"
              >
                Back to Login
              </button>
            </form>
          ) : !isForgotPassword ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Username or Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ margin: 0 }}>Password</label>
                  <span
                    style={{ fontSize: '13px', color: '#0056b3', cursor: 'pointer' }}
                    onClick={() => {
                      setIsForgotPassword(true);
                      setIsRegistering(false);
                      setError("");
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ marginTop: '5px' }}
                />
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <div className="divider">
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
                <span style={{ padding: '0 10px', color: '#888', fontSize: '12px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
              </div>

              <button
                className="google-btn"
                onClick={() => {
                  setIsRegistering(true);
                  setIsForgotPassword(false);
                  setError("");
                }}
                type="button"
              >
                Create New User
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label>Username or Email</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your registered email"
                    disabled={loading || otpSent}
                    style={{ flex: 1 }}
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      className="login-btn"
                      style={{ width: "auto", padding: "0 15px", margin: 0, backgroundColor: "#333", color: "#fff", cursor: "pointer", borderRadius: "20px" }}
                      onClick={handleSendOtp}
                      disabled={loading || !username}
                    >
                      {loading ? "..." : "Send OTP"}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <>
                  <div className="input-group">
                    <label>Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the OTP from your email"
                      disabled={loading}
                    />
                  </div>

                  <div className="input-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    {newPassword.length > 0 && newPassword.length < 6 && (
                      <span style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "block" }}>
                        Password must be at least 6 characters long
                      </span>
                    )}
                  </div>

                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </>
              )}

              <button
                className="google-btn"
                style={{ marginTop: "10px", backgroundColor: "#fff", color: "#333" }}
                onClick={() => {
                  setIsForgotPassword(false);
                  setOtpSent(false);
                  setOtp("");
                  setNewPassword("");
                  setError("");
                }}
                type="button"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}