import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BookingRequest() {
  const [roombookings, setRoombookings] = useState([]);
  const [eventbookings, setEventbookings] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(" ");
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestToUpdate, setGuestToUpdate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [reason, setReason] = useState(""); // State to hold the reason for denial
  const [isDenying, setIsDenying] = useState(false); // To track if the deny action was clicked

  useEffect(() => {
    fetchRoomBooking();
    fetchEventBooking();
  }, [page]);

  function fetchRoomBooking() {
    axios
      .get(`http://localhost:4000/api/roombookings/getroombookings`, {
        params: { page },
      })
      .then((response) => {
        setRoombookings(response.data.retdata);
        console.log(response.data.retdata);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching room bookings:", error);
      });
  }

  function fetchEventBooking() {
    axios
      .get(`http://localhost:4000/api/eventbookings/geteventbookings`, {
        params: { page },
      })
      .then((response) => {
        console.log(response.data.retdata);
        setEventbookings(response.data.retdata);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching event bookings:", error);
      });
  }

  const approveActivity = () => {
    const bookingType = guestToUpdate.type; // Assuming "type" tells us if it's room or event

    if (bookingType === "room") {
      axios
        .patch(
          `http://localhost:4000/api/roombookings/updateroomstatus/${guestToUpdate._id}`,
          { status: "Accepted" }
        )
        .then((response) => {
          if (response.data) {
            console.log(response.data);
            setIsModalOpen(false);
            toast.success("Room booking request accepted successfully!");
            fetchRoomBooking(); // Fetch updated room bookings
          }
        })
        .catch((error) => {
          setIsModalOpen(false);
          const errorMessage =
            error.response?.data?.message || "Something went wrong";
          toast.error("Error: " + errorMessage);
        });
    } else if (bookingType === "event") {
      axios
        .patch(
          `http://localhost:4000/api/roombookings/updateeventstatus/${guestToUpdate._id}`,
          { status: "Accepted" }
        )
        .then((response) => {
          if (response.data) {
            console.log(response.data);
            setIsModalOpen(false);
            toast.success("Event booking request accepted successfully!");
            fetchEventBooking(); // Fetch updated event bookings
          }
        })
        .catch((error) => {
          setIsModalOpen(false);
          const errorMessage =
            error.response?.data?.message || "Something went wrong";
          toast.error("Error: " + errorMessage);
        });
    }
  };

  const denyActivity = () => {
    if (reason.trim() === "") {
      setErrorMessage("Please provide a reason for denying the booking.");
      return;
    }

    const bookingType = guestToUpdate.type;

    if (bookingType === "room") {
      axios
        .patch(
          `http://localhost:4000/api/roombookings/updateroomstatus/${guestToUpdate._id}`,
          { status: "Denied", reason }
        )
        .then((response) => {
          if (response.data) {
            setIsModalOpen(false);
            toast.success("Room booking request denied successfully!");
            fetchRoomBooking();
          }
        })
        .catch((error) => {
          setIsModalOpen(false);
          const errorMessage =
            error.response?.data?.message || "Something went wrong";
          toast.error("Error: " + errorMessage);
        });
    } else if (bookingType === "event") {
      axios
        .patch(
          `http://localhost:4000/api/roombookings/updateeventstatus/${guestToUpdate._id}`,
          { status: "Denied", reason }
        )
        .then((response) => {
          if (response.data) {
            setIsModalOpen(false);
            toast.success("Event booking request denied successfully!");
            fetchEventBooking();
          }
        })
        .catch((error) => {
          setIsModalOpen(false);
          const errorMessage =
            error.response?.data?.message || "Something went wrong";
          toast.error("Error: " + errorMessage);
        });
    }
  };

  const cancelActivity = () => {
    setIsModalOpen(false); 
  };

  function handleAccept(id, type) {
    setStatus("Accepted");
    setGuestToUpdate({ _id: id, type: type }); // Set the type (room or event)
    setIsModalOpen(true);
    setIsDenying(false); // Reset deny state when accepting
  }

  function handleDeny(id, type) {
    setStatus("Denied");
    setGuestToUpdate({ _id: id, type: type }); // Set the type (room or event)
    setIsModalOpen(true);
    setIsDenying(true); // Set denying state when clicking deny
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Booking List</h2>

      {/* Room Bookings Table */}
      <h3 className="text-xl font-semibold mb-4">Room Bookings</h3>
      <table className="w-full border-collapse border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">First Name</th>
            <th className="border border-gray-300 p-2">Last Name</th>
            <th className="border border-gray-300 p-2">Check-in Date</th>
            <th className="border border-gray-300 p-2">Check-out Date</th>
            <th className="border border-gray-300 p-2">Adults</th>
            <th className="border border-gray-300 p-2">Children</th>
            <th className="border border-gray-300 p-2">Nationality</th>
            <th className="border border-gray-300 p-2">Number of Rooms</th>
            <th className="border border-gray-300 p-2">Kitchen</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {roombookings.map((item, index) => (
            <tr key={index} className="text-center bg-gray-100">
              <td className="border p-2">{item.fname}</td>
              <td className="border p-2">{item.lname}</td>
              <td className="border p-2">
                {new Date(item.checkin).toLocaleDateString()}
              </td>
              <td className="border p-2">
                {new Date(item.checkout).toLocaleDateString()}
              </td>
              <td className="border p-2">{item.adult}</td>
              <td className="border p-2">{item.children}</td>
              <td className="border p-2">{item.nationality}</td>
              <td className="border p-2">{item.noofrooms}</td>
              <td className="border p-2">{item.kitchen}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleAccept(item._id, "room")}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeny(item._id, "room")}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Deny
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Event Bookings Table */}
      <h3 className="text-xl font-semibold mb-4 mt-8">Event Bookings</h3>
      <table className="w-full border-collapse border border-gray-300 bg-white">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Event Name</th>
            <th className="border border-gray-300 p-2">Organizer</th>
            <th className="border border-gray-300 p-2">Booking Date</th>
            <th className="border border-gray-300 p-2">Number of Guests</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {eventbookings.map((item, index) => (
            <tr key={index} className="text-center bg-gray-100">
              <td className="border p-2">{item.eventName}</td>
              <td className="border p-2">{item.organizer}</td>
              <td className="border p-2">
                {new Date(item.bookingDate).toLocaleDateString()}
              </td>
              <td className="border p-2">{item.numberOfGuests}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleAccept(item._id, "event")}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeny(item._id, "event")}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Deny
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

      {/* Modal for Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-semibold mb-4">Are you sure?</h3>
            <p className="mb-4">Do you want to {status} this booking?</p>

            {isDenying && (
              <div>
                <label className="block mb-2">Reason for Denial</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="4"
                />
                <p className="text-red-500 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={isDenying ? denyActivity : approveActivity}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Yes
              </button>
              <button
                onClick={cancelActivity}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingRequest;
