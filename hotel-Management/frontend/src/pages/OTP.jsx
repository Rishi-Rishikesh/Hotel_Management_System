import React, { useState } from "react";
import { Phone, MessageSquare, ArrowRight } from "lucide-react";
// import {
//   auth,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
// } from "../firebaseConfig"; // Import from firebase config
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Phone regex to validate international phone number format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified:", response);
          },
        }
      );
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPhoneErrorMessage("");
    setErrorMessage("");

    const cleanedPhone = phone.replace(/\s+/g, ""); // Remove spaces

    if (!cleanedPhone.trim()) {
      setErrorMessage("Please enter your phone number");
      return;
    }

    if (!phoneRegex.test(cleanedPhone)) {
      setPhoneErrorMessage(
        "❌ Invalid phone number! Include country code (e.g., +1234567890)"
      );
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      signInWithPhoneNumber(auth, cleanedPhone, appVerifier)
        .then((confirmation) => {
          setConfirmationResult(confirmation);
          alert("OTP sent successfully!");
          setIsOtpSent(true);
        })
        .catch((error) => {
          console.error("Error sending OTP:", error);
          setErrorMessage("Failed to send OTP. Please try again.");
        });
    } catch (error) {
      console.error("Error setting up recaptcha:", error);
      setErrorMessage("Failed to send OTP. Please try again.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpErrorMessage("");
    setErrorMessage("");

    if (!otp.trim()) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setOtpErrorMessage("❌ OTP must be 6 digits");
      return;
    }

    try {
      if (confirmationResult) {
        confirmationResult
          .confirm(otp)
          .then((result) => {
            alert("OTP Verified! User signed in.");
            console.log("User Info:", result.user);
            navigate("/"); // Navigate to the home page or dashboard
          })
          .catch((error) => alert("Invalid OTP!"));
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Invalid OTP. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1497294815431-9365093b7331?q=80&w=2070')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* OTP Container */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Phone Verification
          </h1>
          <p className="text-gray-200">
            {!isOtpSent
              ? "Enter your phone number to receive a verification code"
              : "Enter the verification code sent to your phone"}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
            {errorMessage}
          </div>
        )}

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border ${
                    phoneErrorMessage ? "border-red-500/50" : "border-white/10"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400`}
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {phoneErrorMessage && (
                <p className="mt-1 text-sm text-red-200">{phoneErrorMessage}</p>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Send Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">
                Verification Code
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  maxLength={6}
                  className={`w-full pl-10 pr-4 py-2 bg-white/5 border ${
                    otpErrorMessage ? "border-red-500/50" : "border-white/10"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400`}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              </div>
              {otpErrorMessage && (
                <p className="mt-1 text-sm text-red-200">{otpErrorMessage}</p>
              )}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Verify Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="flex items-center justify-center w-full px-4 py-2 bg-transparent border border-white/20 hover:bg-white/5 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

export default App;
