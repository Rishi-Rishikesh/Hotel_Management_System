import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Customer.css";

function NewPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState(" ");
  const [confirmpassword, setConfirmPassword] = useState(" ");
  const [errorMessage, setErrorMessage] = useState(" ");

  const [passwordErrorMessage, setPasswordErrorMessage] = useState(" ");
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState(" ");
  const [success, setSuccess] = useState(0);

  const passwordRegex = /^[A-Z][A-Za-z\d@$!%*?&]{7,}$/;

  function handleSubmit(event) {
    event.preventDefault();
    setSuccess(0);

    if (password.trim() === "" || confirmpassword.trim() === "") {
      setErrorMessage("One of the fields is missing");
    } else {
      if (passwordRegex.test(password)) {
        setPasswordErrorMessage(" ");
        setSuccess((prev) => prev + 1);
      } else {
        setPasswordErrorMessage(
          "❌ Password must be at least 8 characters, start with a capital letter, include at least one number and one special character."
        );
      }

      if (password === confirmpassword) {
        setConfirmPasswordErrorMessage(" ");
        setSuccess((prev) => prev + 1);
      } else {
        setConfirmPasswordErrorMessage(
          "Password and Confirm Password do not match"
        );
      }

      if (success === 2) {
        axios
          .put(
            "https://localhost:4000/api/guests/newpassword",
            {
              password,
            },
            { withCredentials: true }
          )
          .then((response) => {
            if (response.data === true) {
              navigate("/login");
            } else {
              setErrorMessage(response.data);
            }
          })
          .catch((error) => {
            console.error("Error setting new password:", error);
            setError("Failed to update password.");
          });
      }
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Set New Password</h1>
        <p>{errorMessage}</p>
        <div className="password-guidelines">
          <h4>Password Guidelines:</h4>
          <ul>
            <li>Password must be at least 8 characters long</li>
            <li>Must start with a capital letter</li>
            <li>Must contain at least one number</li>
            <li>Must include at least one special character (e.g., @$!%*?&)</li>
          </ul>
        </div>
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter Your Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <p>{passwordErrorMessage}</p>
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Re-Enter Your Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p>{confirmPasswordErrorMessage}</p>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default NewPassword;
