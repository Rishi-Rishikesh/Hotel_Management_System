import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

function GuestRegistration() {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["user"]);
  const [loggedInEmail, setLoggedInEmail] = useState(cookies?.user?.email || "");

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [address, setAddress] = useState("");
  const [nic, setNic] = useState("");
  const [phonenum, setPhonenum] = useState("");
  const [gender, setGender] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [fnameErrorMessage, setFnameErrorMessage] = useState("");
  const [lnameErrorMessage, setLnameErrorMessage] = useState("");
  const [addressErrorMessage, setAddressErrorMessage] = useState("");
  const [nicErrorMessage, setNicErrorMessage] = useState("");
  const [phonenumErrorMessage, setPhonenumErrorMessage] = useState("");
  const [genderErrorMessage, setGenderErrorMessage] = useState("");

  const nameRegex = /^[A-Za-z\s'-]{2,50}$/;
  const phoneRegex = /^\+94[1-9][0-9]{8}$/;
  const addressRegex = /^\d+\s[A-Za-z0-9\s,.#-]+$/;
  const nicRegex = /^(?:\d{9}[VX]|\d{12})$/;

  // Fetch user email if cookie is missing
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!loggedInEmail) {
        try {
          console.log("Fetching user from /api/guests/me");
          const response = await axios.get("http://localhost:4000/api/guests/me", {
            withCredentials: true,
          });
          if (response.data.success && response.data.email) {
            const userData = response.data;
            setLoggedInEmail(userData.email);
            setCookie("user", userData, { path: "/", maxAge: 86400 });
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("Fetched user:", userData);
          } else {
            throw new Error("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("Session expired. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    };
    fetchUserEmail();
  }, [loggedInEmail, setCookie, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Cookies:", cookies);
    console.log("loggedInEmail:", loggedInEmail);

    setErrorMessage("");
    setFnameErrorMessage("");
    setLnameErrorMessage("");
    setAddressErrorMessage("");
    setNicErrorMessage("");
    setPhonenumErrorMessage("");
    setGenderErrorMessage("");

    if (!loggedInEmail) {
      setErrorMessage("No logged-in user found. Please log in to continue.");
      toast.error("Please log in first.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!fname || !lname || !address || !nic || !phonenum || !gender) {
      setErrorMessage("All fields are required.");
      toast.error("Please complete all fields.");
      return;
    }

    if (!nameRegex.test(fname)) {
      setFnameErrorMessage("Invalid First Name");
      toast.error("Invalid First Name");
      return;
    }

    if (!nameRegex.test(lname)) {
      setLnameErrorMessage("Invalid Last Name");
      toast.error("Invalid Last Name");
      return;
    }

    if (!addressRegex.test(address)) {
      setAddressErrorMessage("Invalid Address");
      toast.error("Invalid Address format");
      return;
    }

    if (!nicRegex.test(nic)) {
      setNicErrorMessage("Invalid NIC");
      toast.error("NIC must be 9 digits + V/X or 12 digits");
      return;
    }

    if (!phoneRegex.test(phonenum)) {
      setPhonenumErrorMessage("Invalid Phone Number");
      toast.error("Use format +94XXXXXXXXX");
      return;
    }

    if (!gender) {
      setGenderErrorMessage("Please select gender");
      toast.error("Gender is required");
      return;
    }

    try {
      console.log("Submitting registration...");
      const response = await axios.post(
        "http://localhost:4000/api/guests/registration",
        {
          email: loggedInEmail,
          fname,
          lname,
          address,
          nic,
          phonenum,
          gender,
          profileImage: "",
        },
        { withCredentials: true }
      );
      console.log("Registration response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Registration failed");
      }

      const userData = response.data.user;
      setCookie("user", userData, { path: "/", maxAge: 86400 });
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Registration successful!");

      navigate("/guestdashboard", { state: { profileUpdated: true } });
    } catch (error) {
      console.error("Registration error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-100 to-teal-100">
      <form
        onSubmit={handleSubmit}
        className="text-gray-800 bg-white rounded-xl p-10 shadow-2xl w-full max-w-4xl"
      >
        <h1 className="text-4xl font-serif text-center text-gray-800 mb-8">
          Guest Registration Form
        </h1>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-medium text-gray-800">First Name</label>
            <input
              type="text"
              name="fname"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Eg: John"
              required
            />
            <p className="text-red-600 text-sm">{fnameErrorMessage}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-800">Last Name</label>
            <input
              type="text"
              name="lname"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Eg: Doe"
              required
            />
            <p className="text-red-600 text-sm">{lnameErrorMessage}</p>
          </div>

          <div className="col-span-2">
            <label className="block font-medium text-gray-800">Address</label>
            <textarea
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Eg: 123 Main St, Colombo"
              required
            />
            <p className="text-red-600 text-sm">{addressErrorMessage}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-800">NIC</label>
            <input
              type="text"
              name="nic"
              value={nic}
              onChange={(e) => setNic(e.target.value.toUpperCase())}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Eg: 123456789V or 200012345678"
              required
            />
            <p className="text-red-600 text-sm">{nicErrorMessage}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-800">Phone Number</label>
            <input
              type="text"
              name="phonenum"
              value={phonenum}
              onChange={(e) => setPhonenum(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Eg: +94712345678"
              required
            />
            <p className="text-red-600 text-sm">{phonenumErrorMessage}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-800">Gender</label>
            <select
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other / Prefer not to say</option>
            </select>
            <p className="text-red-600 text-sm">{genderErrorMessage}</p>
          </div>
        </div>

        <p className="text-red-600 text-center text-sm mt-4">{errorMessage}</p>

        <button
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-md hover:from-blue-600 hover:to-teal-600 transition-all"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default GuestRegistration;