import React, { useState } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import Dashboard from "./Dashboard";
import "./LoginForm.css";

const LoginForm = () => {

  const [isRegistering, setIsRegistering] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [generatedOtp, setGeneratedOtp] = useState("");
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setIsForgotPassword(false);
    setShowOtpInput(false);
    setError("");
    setInfo("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setOtp("");
  };

  const handleForgotPasswordLink = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const savedData = localStorage.getItem("registerData");
    if (!savedData) {
      return setError("No registered user found.");
    }

    const parsedData = JSON.parse(savedData);
    if (username === parsedData.userName) {
      setIsForgotPassword(true);
      setEmail(parsedData.email);
    } else {
      setError("Username not found. Please enter a registered username.");
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const savedData = localStorage.getItem("registerData");
    const parsedData = JSON.parse(savedData);

    if (email === parsedData.email) {
      const otpCode = generateOtp();
      setGeneratedOtp(otpCode);
      setShowOtpInput(true);
      setInfo(`OTP sent to your email: ${otpCode}`);
    } else {
      setError("Email not found. Please enter a registered email.");
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (otp !== generatedOtp) {
      return setError("Invalid OTP. Please try again.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (password.length > 12) {
      return setError("Password cannot be more than 12 characters");
    }
    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    const savedData = localStorage.getItem("registerData");
    const parsedData = JSON.parse(savedData);

    localStorage.setItem(
      "registerData",
      JSON.stringify({ ...parsedData, password })
    );

    setInfo("Password updated successfully! Please log in.");
    setIsForgotPassword(false);
    setShowOtpInput(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setOtp("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!username.trim()) {
      return setError("Username is required");
    }

    if (isRegistering) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return setError("Please enter a valid email address");
      }
      if (password.length < 6) {
        return setError("Password must be at least 6 characters");
      }
      if (password.length > 12) {
        return setError("Password cannot be more than 12 characters");
      }
      if (password !== confirm) {
        return setError("Passwords do not match");
      }

      const userData = { userName: username, email, password };
      localStorage.setItem("registerData", JSON.stringify(userData));
      setInfo("Registration successful! Please log in.");
      setIsRegistering(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirm("");
    } else {
 
      const savedData = localStorage.getItem("registerData");
      if (!savedData) {
        return setError("No registered user found. Please register first.");
      }

      const parsedData = JSON.parse(savedData);
      if (username === parsedData.userName && password === parsedData.password) {
        setIsLoggedIn(true);
      } else {
        setError("Invalid username or password");
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsRegistering(false);
    setIsForgotPassword(false);
    setShowOtpInput(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setOtp("");
    setInfo("");
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="wrapper">
      <form
        onSubmit={
          isForgotPassword
            ? showOtpInput
              ? handleResetPassword
              : handleSendOtp
            : handleSubmit
        }
      >
        <h1>
          {isForgotPassword
            ? showOtpInput
              ? "Reset Password"
              : "Forgot Password"
            : isRegistering
            ? "Register"
            : "Login"}
        </h1>

        {info && <p className="info-message">{info}</p>}
        {error && <p className="error-message">{error}</p>}

        {!isForgotPassword && (
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>
        )}

        {(isRegistering || (isForgotPassword && !showOtpInput)) && (
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={isForgotPassword} 
            />
            <FaEnvelope className="icon" />
          </div>
        )}

        {isForgotPassword && showOtpInput && (
          <>
            <div className="input-box">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>
          </>
        )}

        {!isRegistering && !isForgotPassword && (
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>
        )}

        {isRegistering && (
          <>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>
          </>
        )}

        {!isRegistering && !isForgotPassword && (
          <div className="remember-forgot">
           
            <a href="#" onClick={handleForgotPasswordLink}>
              Forgot Password?
            </a>
          </div>
        )}

        <button type="submit">
          {isForgotPassword
            ? showOtpInput
              ? "Reset Password"
              : "Send OTP"
            : isRegistering
            ? "Register"
            : "Login"}
        </button>
       
        <div className="register-link">
          {isForgotPassword ? (
            <p>
              Remember your password?{" "}
              <a href="#" className="link-btn" onClick={() => setIsForgotPassword(false)}>
                Login
              </a>
            </p>
          ) : isRegistering ? (
            <p>
              Already have an account?{" "}
              <a href="#" className="link-btn" onClick={toggleForm}>
                Login</a>
            </p>) : 
            
          (<p>
              Don't have an account?{" "}
              <a href="#" className="link-btn" onClick={toggleForm}>
                Register</a>
            </p>)}
        </div></form></div>
  );
};

export default LoginForm;
