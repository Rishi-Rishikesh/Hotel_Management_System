// src/hooks/useBookingForm.js
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const useBookingForm = () => {
  const [cookies] = useCookies(["user"]);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [useCustomDetails, setUseCustomDetails] = useState(false);
  const [customDetails, setCustomDetails] = useState({
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
    nic: "",
    gender: "",
  });

  useEffect(() => {
    if (cookies.user?.email) {
      axios
        .get("http://localhost:4000/api/guests/me", { withCredentials: true })
        .then((response) => {
          const { fname, lname, email, address, phoneNumber, nic, gender, _id } = response.data;
          setUserDetails({
            name: `${fname || ""} ${lname || ""}`.trim() || "No name provided",
            email: email || "No email provided",
            address: address || "No address provided",
            phoneNumber: phoneNumber || "No phone number provided",
            nic: nic || "No NIC provided",
            gender: gender || "Not specified",
            _id,
          });
        })
        .catch(() => {
          toast.error("Please log in to continue");
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [cookies.user, navigate]);

  const validateCustomDetails = () => {
    const errors = {};
    if (useCustomDetails) {
      if (!customDetails.name || !/^[A-Za-z\s]{2,50}$/.test(customDetails.name)) {
        errors.name = "Please enter a valid name (2-50 letters)";
      }
      if (!customDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customDetails.email)) {
        errors.email = "Please enter a valid email";
      }
      if (customDetails.phoneNumber && !/^\+94[1-9][0-9]{8}$/.test(customDetails.phoneNumber)) {
        errors.phoneNumber = "Please enter a valid Sri Lankan phone number (+94)";
      }
      if (customDetails.nic && !/^[A-Za-z0-9]{8,12}$/.test(customDetails.nic)) {
        errors.nic = "Please enter a valid NIC (8-12 alphanumeric)";
      }
    }
    return errors;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return {
    userDetails,
    useCustomDetails,
    setUseCustomDetails,
    customDetails,
    setCustomDetails,
    validateCustomDetails,
    formatDate,
  };
};

export default useBookingForm;