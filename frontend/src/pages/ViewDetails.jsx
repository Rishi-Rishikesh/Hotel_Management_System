import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ViewDetails = () => {
  const { id } = useParams(); // Get customer ID from the URL
  const [guest, setGuest] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/guests/viewguest/${id}`
      );
      if (response.data.success) {
        setGuest(response.data.guest);
      } else {
        toast.error(response.data.message || "Failed to load guest data");
      }
    } catch (error) {
      console.error("Error fetching guest data:", error);
      toast.error("An error occurred while fetching guest data");
    }
  };

  if (!guest)
    return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
          Customer Details
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-700">First Name:</p>
              <p className="text-lg text-gray-900">{guest.fname}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Last Name:</p>
              <p className="text-lg text-gray-900">{guest.lname}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-700">Email:</p>
              <p className="text-lg text-gray-900">{guest.email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Phone Number:</p>
              <p className="text-lg text-gray-900">{guest.phoneNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-700">Address:</p>
              <p className="text-lg text-gray-900">{guest.address}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">NIC:</p>
              <p className="text-lg text-gray-900">{guest.nic}</p>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-700">Gender:</p>
            <p className="text-lg text-gray-900">{guest.gender}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;
