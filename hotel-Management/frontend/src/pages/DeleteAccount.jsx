import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DeleteAccount() {
  const [guests, setGuests] = useState([]);
  const [email, setEmail] = useState(""); // Store email of guest to delete
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [reason, setReason] = useState(""); // To store the reason for deletion
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchGuests();
  }, [page, search]);

  const fetchGuests = () => {
    axios
      .get(`http://localhost:4000/api/guests/getguest`, {
        params: { page, search },
      })
      .then((response) => {
        setGuests(response.data.retdata);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching guest data:", error);
      });
  };

  const handleDelete = (guestId, guestEmail) => {
    setGuestToDelete(guestId); // Set guest ID to delete
    setEmail(guestEmail); // Set the email of the guest to delete
    setIsModalOpen(true); // Open confirmation modal
  };

  const confirmDelete = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for deletion.");
      return; // Stop deletion if no reason is provided
    }

    axios
      .delete("http://localhost:4000/api/guests/deleteguest", {
        data: { reason, email },
      })
      .then((response) => {
        if (response.data.success) {
          toast.success("Guest account deleted successfully!");

          // Remove the deleted guest from the state
          setGuests((prevGuests) =>
            prevGuests.filter((guest) => guest._id !== guestToDelete)
          );

          setIsModalOpen(false); // Close the modal
        }
      })
      .catch((error) => {
        toast.error("Error: " + error.message || "Something went wrong.");
      });
  };

  const cancelDelete = () => {
    setIsModalOpen(false); // Close the modal without deleting
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-4xl text-center text-blue-700 underline font-bold mb-4">
        Customer List
      </h2>

      {/* Name Search Input */}
      <input
        type="text"
        placeholder="Search by Guest Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded bg-white w-9/12 flex mt-16 mb-10 mx-auto"
      />

      {/* Guests Table */}
      <table className="w-full border-collapse border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Full Name</th>
            <th className="border border-gray-300 p-2">Address</th>
            <th className="border border-gray-300 p-2">NIC</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Phone</th>
            <th className="border border-gray-300 p-2">Gender</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr key={guest._id} className="text-center hover:bg-gray-100">
              <td className="border border-gray-300 p-2">
                {guest.fname} {guest.lname}
              </td>
              <td className="border border-gray-300 p-2">{guest.address}</td>
              <td className="border border-gray-300 p-2">{guest.nic}</td>
              <td className="border border-gray-300 p-2">{guest.email}</td>
              <td className="border border-gray-300 p-2">
                {guest.phoneNumber}
              </td>
              <td className="border border-gray-300 p-2">{guest.gender}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => handleDelete(guest._id, guest.email)} // Pass guest's email here
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete Account
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-4 gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-lg font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-semibold mb-4">Are you sure?</h3>
            <p className="mb-4">Do you want to delete this guest account?</p>

            {/* Reason for Deletion Text Area */}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for deletion"
              className="w-full p-2 border rounded mb-4"
              rows="4"
            ></textarea>

            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                No
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes
              </button>
            </div>
            {errorMessage && (
              <div className="mt-4 text-red-500 text-sm">{errorMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteAccount;
