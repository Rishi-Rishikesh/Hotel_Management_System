import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Loader2, Edit, Calendar, Check, X, Trash, LogOut } from "lucide-react";
import { getAuth } from "firebase/auth";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import html2pdf from "html2pdf.js";

const API_URL = "http://localhost:4000";

function AdminBookingsManage() {
  const navigate = useNavigate();
  const [roomBookings, setRoomBookings] = useState([]);
  const [hallBookings, setHallBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const role = localStorage.getItem("role");

  const colors = {
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    secondary: "#64748b",
    background: "#f8fafc",
    surface: "#ffffff",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    error: "#ef4444",
    success: "#10b981",
    border: "#e2e8f0",
  };

  const refreshToken = async () => {
    console.log("Attempting to refresh token...");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user logged in. Please log in again.");
      }
      const newToken = await user.getIdToken(true);
      console.log("New token obtained:", newToken ? "Success" : "Failed");
      localStorage.setItem("token", newToken);
      setToken(newToken);
      return newToken;
    } catch (err) {
      console.error("Error refreshing token:", err.message);
      setError("Session expired. Please log in as an admin.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      document.cookie = "user=; Max-Age=0; path=/";
      toast.error("Session expired. Please log in as an admin.");
      navigate("/login");
      return null;
    }
  };
    
  const fetchBookings = async (currentToken) => {
    console.log("Fetching bookings with token:", currentToken ? "Present" : "Missing");
    try {
      console.log("Checking role:", role);
      if (role !== "Admin") {
        throw new Error("Access denied. Admin role required.");
      }
      if (!currentToken) {
        throw new Error("No authentication token found.");
      }
      const config = {
        headers: { Authorization: `Bearer ${currentToken}` },
        withCredentials: true,
      };
      console.log("Sending requests with config:", config);

      const [roomResponse, hallResponse] = await Promise.all([
        axios.get(`${API_URL}/api/bookings/rooms`, config),
        axios.get(`${API_URL}/api/bookings/halls`, config),
      ]);
      console.log("Room response:", roomResponse.data);
      console.log("Hall response:", hallResponse.data);

      const rooms = roomResponse.data.data.map((booking) => ({
        ...booking,
        guest: booking.guest || null,
        deleted: booking.deleted || false,
      }));

      const halls = hallResponse.data.data.map((booking) => ({
        ...booking,
        guest: booking.guest || null,
        deleted: booking.deleted || false,
      }));

      setRoomBookings(rooms);
      setHallBookings(halls);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      });
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          return fetchBookings(newToken);
        }
      } else if (err.response?.status === 403 || err.message === "Access denied. Admin role required.") {
        setError(`Access denied: ${err.response?.data?.message || "You must be an admin to view this page."}`);
        toast.error(`Access denied: ${err.response?.data?.message || "Please log in as an admin."}`);
      } else {
        const errorMessage =
          err.response?.status === 500
            ? "Server error: Unable to fetch bookings. Please check the backend."
            : err.response?.data?.message || err.message || "Failed to load bookings.";
        setError(errorMessage);
        // toast.error(errorMessage);
      }
      setLoading(false);
      navigate("/admin-dashboard");
    }
  };


  const handleStatusChange = async (bookingId, action, type, reason = "") => {
  try {
    console.log('handleStatusChange called with:', { bookingId, action, type, reason });

    // Validate type
    if (!['room', 'hall'].includes(type)) {
      throw new Error(`Invalid booking type: ${type}`);
    }

    // Validate bookingId
    if (!bookingId || !/^[0-9a-fA-F]{24}$/.test(bookingId)) {
      throw new Error('Invalid booking ID');
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    };
    let response;
    const typeSegment = type === 'room' ? 'rooms' : 'halls'; // Use 'rooms' or 'halls' based on type

    if (action === "approve") {
      const url = `${API_URL}/api/bookings/${typeSegment}/${bookingId}/approve`;
      console.log('Approving booking URL:', url);
      response = await axios.post(url, {}, config);
      toast.success(`Booking ${bookingId} approved successfully`);
    } else if (action === "reject") {
      const url = `${API_URL}/api/bookings/${typeSegment}/${bookingId}/reject`;
      console.log('Rejecting booking URL:', url);
      response = await axios.post(
        url,
        { rejectedReason: reason || "Cancelled by admin" },
        config
      );
      toast.success(`Booking ${bookingId} rejected successfully`);
    } else if (action === "delete") {
      const url = `${API_URL}/api/bookings/${typeSegment}/${bookingId}`;
      console.log('Deleting booking URL:', url);
      response = await axios.delete(url, config);
      toast.success(`Booking ${bookingId} deleted successfully`);
    }

    console.log(`Response from ${action} action:`, response.data);

    // Update local state based on type
    const updateBookings = (prev) =>
      prev.map((b) =>
        b._id === bookingId
          ? {
              ...b,
              bookingStatus: action === "approve" ? "confirmed" : action === "reject" ? "cancelled" : b.bookingStatus,
              rejectedReason: action === "reject" ? reason : b.rejectedReason,
              deleted: action === "delete" ? true : b.deleted || false,
            }
          : b
      );

    if (type === "room") {
          setRoomBookings(updateBookings);
    } else {
      setHallBookings(updateBookings);
    }

    if (action === "reject") {
      await fetchBookings(token);
    }
  } catch (err) {
    console.error(`Error performing ${action} on booking ${bookingId}:`, {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url,
    });
    toast.error(`Failed to ${action} booking: ${err.response?.data?.message || err.message}`);
  }
};

  const handleCheckout = async (bookingId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };
      const response = await axios.post(`${API_URL}/api/bookings/rooms/${bookingId}/checkout`, {}, config);
      toast.success(`Booking ${bookingId} checked out successfully`);
      setRoomBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, bookingStatus: "completed" }
            : b
        )
      );
    } catch (err) {
      console.error(`Error checking out booking ${bookingId}:`, err);
      toast.error(`Failed to check out booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const generateRoomBookingsWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Room Bookings Report", size: 32, bold: true })],
              alignment: "center",
              spacing: { after: 400 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Booking ID")] }),
                    new TableCell({ children: [new Paragraph("Guest Name")] }),
                    new TableCell({ children: [new Paragraph("Room Number")] }),
                    new TableCell({ children: [new Paragraph("Check-In Date")] }),
                    new TableCell({ children: [new Paragraph("Check-Out Date")] }),
                    new TableCell({ children: [new Paragraph("Status")] }),
                    new TableCell({ children: [new Paragraph("Deleted")] }),
                    new TableCell({ children: [new Paragraph("Rejection Reason")] }),
                  ],
                }),
                ...roomBookings.map(
                  (booking) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(booking._id)] }),
                        new TableCell({ children: [new Paragraph(booking.guest?.firstName || "Unknown Guest")] }),
                        new TableCell({ children: [new Paragraph(booking.roomNumber || "N/A")] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"
                            ),
                          ],
                        }),
                        new TableCell({ children: [new Paragraph(booking.bookingStatus || "Unknown")] }),
                        new TableCell({ children: [new Paragraph(booking.deleted ? "Yes" : "No")] }),
                        new TableCell({ children: [new Paragraph(booking.rejectedReason || "")] }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "room_bookings_report.docx";
      link.click();
    });
  };

  const generateRoomBookingsPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
        }
        h1 {
          text-align: center;
          font-size: 16px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 5px;
          text-align: left;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        col:nth-child(1) { width: 15%; }
        col:nth-child(2) { width: 15%; }
        col:nth-child(3) { width: 10%; }
        col:nth-child(4) { width: 15%; }
        col:nth-child(5) { width: 15%; }
        col:nth-child(6) { width: 10%; }
        col:nth-child(7) { width: 10%; }
        col:nth-child(8) { width: 10%; }
      </style>
      <h1>Room Bookings Report</h1>
      <table>
        <colgroup>
          <col><col><col><col><col><col><col><col>
        </colgroup>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Guest Name</th>
            <th>Room Number</th>
            <th>Check-In Date</th>
            <th>Check-Out Date</th>
            <th>Status</th>
            <th>Deleted</th>
            <th>Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          ${roomBookings
            .map(
              (booking) => `
                <tr>
                  <td>${booking._id}</td>
                  <td>${booking.guest?.firstName || "Unknown Guest"}</td>
                  <td>${booking.roomNumber || "N/A"}</td>
                  <td>${
                    booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"
                  }</td>
                  <td>${
                    booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"
                  }</td>
                  <td>${booking.bookingStatus || "Unknown"}</td>
                  <td>${booking.deleted ? "Yes" : "No"}</td>
                  <td>${booking.rejectedReason || ""}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const opt = {
      margin: 0.5,
      filename: "room_bookings_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
  };

  const generateHallBookingsWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Hall Bookings Report", size: 32, bold: true })],
              alignment: "center",
              spacing: { after: 400 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Booking ID")] }),
                    new TableCell({ children: [new Paragraph("Guest Name")] }),
                    new TableCell({ children: [new Paragraph("Hall Number")] }),
                    new TableCell({ children: [new Paragraph("Event Date")] }),
                    new TableCell({ children: [new Paragraph("Event Type")] }),
                    new TableCell({ children: [new Paragraph("Status")] }),
                    new TableCell({ children: [new Paragraph("Deleted")] }),
                    new TableCell({ children: [new Paragraph("Rejection Reason")] }),
                  ],
                }),
                ...hallBookings.map(
                  (booking) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(booking._id)] }),
                        new TableCell({ children: [new Paragraph(booking.guest?.firstName || "Unknown Guest")] }),
                        new TableCell({ children: [new Paragraph(booking.hall?.number || booking.hallId || "N/A")] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"
                            ),
                          ],
                        }),
                        new TableCell({ children: [new Paragraph(booking.eventType || "N/A")] }),
                        new TableCell({ children: [new Paragraph(booking.bookingStatus || "Unknown")] }),
                        new TableCell({ children: [new Paragraph(booking.deleted ? "Yes" : "No")] }),
                        new TableCell({ children: [new Paragraph(booking.rejectedReason || "")] }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "hall_bookings_report.docx";
      link.click();
    });
  };

  const generateHallBookingsPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
        }
        h1 {
          text-align: center;
          font-size: 16px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 5px;
          text-align: left;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        col:nth-child(1) { width: 15%; }
        col:nth-child(2) { width: 15%; }
        col:nth-child(3) { width: 15%; }
        col:nth-child(4) { width: 15%; }
        col:nth-child(5) { width: 15%; }
        col:nth-child(6) { width: 10%; }
        col:nth-child(7) { width: 10%; }
        col:nth-child(8) { width: 10%; }
      </style>
      <h1>Hall Bookings Report</h1>
      <table>
        <colgroup>
          <col><col><col><col><col><col><col><col>
        </colgroup>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Guest Name</th>
            <th>Hall Number</th>
            <th>Event Date</th>
            <th>Event Type</th>
            <th>Status</th>
            <th>Deleted</th>
            <th>Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          ${hallBookings
            .map(
              (booking) => `
                <tr>
                  <td>${booking._id}</td>
                  <td>${booking.guest?.firstName || "Unknown Guest"}</td>
                  <td>${booking.hall?.number || booking.hallId || "N/A"}</td>
                  <td>${
                    booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"
                  }</td>
                  <td>${booking.eventType || "N/A"}</td>
                  <td>${booking.bookingStatus || "Unknown"}</td>
                  <td>${booking.deleted ? "Yes" : "No"}</td>
                  <td>${booking.rejectedReason || ""}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const opt = {
      margin: 0.5,
      filename: "hall_bookings_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
  };

  const generateCombinedBookingsWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Combined Bookings Report", size: 32, bold: true })],
              alignment: "center",
              spacing: { after: 400 },
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Type")] }),
                    new TableCell({ children: [new Paragraph("Booking ID")] }),
                    new TableCell({ children: [new Paragraph("Guest Name")] }),
                    new TableCell({ children: [new Paragraph("Room/Hall Number")] }),
                    new TableCell({ children: [new Paragraph("Check-In/Event Date")] }),
                    new TableCell({ children: [new Paragraph("Check-Out Date")] }),
                    new TableCell({ children: [new Paragraph("Event Type")] }),
                    new TableCell({ children: [new Paragraph("Status")] }),
                    new TableCell({ children: [new Paragraph("Deleted")] }),
                    new TableCell({ children: [new Paragraph("Rejection Reason")] }),
                  ],
                }),
                ...roomBookings.map(
                  (booking) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph("Room")] }),
                        new TableCell({ children: [new Paragraph(booking._id)] }),
                        new TableCell({ children: [new Paragraph(booking.guest?.firstName || "Unknown Guest")] }),
                        new TableCell({ children: [new Paragraph(booking.roomNumber || "N/A")] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"
                            ),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"
                            ),
                          ],
                        }),
                        new TableCell({ children: [new Paragraph("N/A")] }),
                        new TableCell({ children: [new Paragraph(booking.bookingStatus || "Unknown")] }),
                        new TableCell({ children: [new Paragraph(booking.deleted ? "Yes" : "No")] }),
                        new TableCell({ children: [new Paragraph(booking.rejectedReason || "")] }),
                      ],
                    })
                ),
                ...hallBookings.map(
                  (booking) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph("Hall")] }),
                        new TableCell({ children: [new Paragraph(booking._id)] }),
                        new TableCell({ children: [new Paragraph(booking.guest?.firstName || "Unknown Guest")] }),
                        new TableCell({ children: [new Paragraph(booking.hall?.number || booking.hallId || "N/A")] }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"
                            ),
                          ],
                        }),
                        new TableCell({ children: [new Paragraph("N/A")] }),
                        new TableCell({ children: [new Paragraph(booking.eventType || "N/A")] }),
                        new TableCell({ children: [new Paragraph(booking.bookingStatus || "Unknown")] }),
                        new TableCell({ children: [new Paragraph(booking.deleted ? "Yes" : "No")] }),
                        new TableCell({ children: [new Paragraph(booking.rejectedReason || "")] }),
                      ],
                    })
                ),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "combined_bookings_report.docx";
      link.click();
    });
  };

  const generateCombinedBookingsPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.2;
        }
        h1 {
          text-align: center;
          font-size: 16px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 5px;
          text-align: left;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        col:nth-child(1) { width: 10%; }
        col:nth-child(2) { width: 15%; }
        col:nth-child(3) { width: 15%; }
        col:nth-child(4) { width: 10%; }
        col:nth-child(5) { width: 15%; }
        col:nth-child(6) { width: 10%; }
        col:nth-child(7) { width: 10%; }
        col:nth-child(8) { width: 10%; }
        col:nth-child(9) { width: 10%; }
        col:nth-child(10) { width: 10%; }
      </style>
      <h1>Combined Bookings Report</h1>
      <table>
        <colgroup>
          <col><col><col><col><col><col><col><col><col><col>
        </colgroup>
        <thead>
          <tr>
            <th>Type</th>
            <th>Booking ID</th>
            <th>Guest Name</th>
            <th>Room/Hall Number</th>
            <th>Check-In/Event Date</th>
            <th>Check-Out Date</th>
            <th>Event Type</th>
            <th>Status</th>
            <th>Deleted</th>
            <th>Rejection Reason</th>
          </tr>
        </thead>
        <tbody>
          ${roomBookings
            .map(
              (booking) => `
                <tr>
                  <td>Room</td>
                  <td>${booking._id}</td>
                  <td>${booking.guest?.firstName || "Unknown Guest"}</td>
                  <td>${booking.roomNumber || "N/A"}</td>
                  <td>${
                    booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"
                  }</td>
                  <td>${
                    booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"
                  }</td>
                  <td>N/A</td>
                  <td>${booking.bookingStatus || "Unknown"}</td>
                  <td>${booking.deleted ? "Yes" : "No"}</td>
                  <td>${booking.rejectedReason || ""}</td>
                </tr>
              `
            )
            .join("")}
          ${hallBookings
            .map(
              (booking) => `
                <tr>
                  <td>Hall</td>
                  <td>${booking._id}</td>
                  <td>${booking.guest?.firstName || "Unknown Guest"}</td>
                  <td>${booking.hall?.number || booking.hallId || "N/A"}</td>
                  <td>${
                    booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "N/A"
                  }</td>
                  <td>N/A</td>
                  <td>${booking.eventType || "N/A"}</td>
                  <td>${booking.bookingStatus || "Unknown"}</td>
                  <td>${booking.deleted ? "Yes" : "No"}</td>
                  <td>${booking.rejectedReason || ""}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const opt = {
      margin: 0.5,
      filename: "combined_bookings_report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (!token) {
      setError("No authentication token found. Please log in as an admin.");
      toast.error("Please log in as an admin.");
      navigate("/login");
      return;
    }
    fetchBookings(token);
  }, [navigate, token]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="animate-spin text-3xl" />
          <span className="text-lg font-semibold">Loading bookings...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">{error}</p>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log in as Admin
            </button>
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Calendar className="mr-2" />
            Manage Bookings
          </h1>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={generateRoomBookingsWord}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              Room Report (Word)
            </button>
            <button
              onClick={generateRoomBookingsPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              Room Report (PDF)
            </button>
            <button
              onClick={generateHallBookingsWord}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              Hall Report (Word)
            </button>
            <button
              onClick={generateHallBookingsPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              Hall Report (PDF)
            </button>
            <button
              onClick={generateCombinedBookingsWord}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              Combined Report (Word)
            </button>
            <button
              onClick={generateCombinedBookingsPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              Combined Report (PDF)
            </button>
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">Room Bookings</h2>
          {roomBookings.filter((booking) => !booking.deleted).length === 0 ? (
            <p className="text-slate-600">No active room bookings found.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md border" style={{ borderColor: colors.border }}>
              <table className="min-w-full divide-y" style={{ divideColor: colors.border }}>
                <thead style={{ backgroundColor: colors.background }}>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Guest
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Room Number
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Check-In
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Check-Out
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: colors.border }}>
                  {roomBookings
                    .filter((booking) => !booking.deleted)
                    .map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.guest?.firstName || "Unknown Guest"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.roomNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.checkInDate
                            ? new Date(booking.checkInDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.checkOutDate
                            ? new Date(booking.checkOutDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.bookingStatus || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                          <button
                            onClick={() => navigate(`/edit-booking/room/${booking._id}`)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          {booking.bookingStatus === "confirmed" && (
                            <button
                              onClick={() => handleCheckout(booking._id)}
                              className="text-purple-600 hover:text-purple-800 flex items-center"
                            >
                              <LogOut size={16} className="mr-1" />
                              Check-Out
                            </button>
                          )}
                          <div className="relative group">
                            <button className="text-green-600 hover:text-green-800 flex items-center">
                              Status
                            </button>
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md py-2 z-10">
                              {booking.bookingStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(booking._id, "approve", "room")}
                                    className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                  >
                                    <Check size={16} className="inline mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt("Enter rejection reason:");
                                      if (reason) handleStatusChange(booking._id, "reject", "room", reason);
                                    }}
                                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <X size={16} className="inline mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this booking?")) {
                                    handleStatusChange(booking._id, "delete", "room");
                                  }
                                }}
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full text-left"
                              >
                                <Trash size={16} className="inline mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">Hall Bookings</h2>
          {hallBookings.filter((booking) => !booking.deleted).length === 0 ? (
            <p className="text-slate-600">No active hall bookings found.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md border" style={{ borderColor: colors.border }}>
              <table className="min-w-full divide-y" style={{ divideColor: colors.border }}>
                <thead style={{ backgroundColor: colors.background }}>
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Guest
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Hall Number
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Event Date
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Event Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: colors.textSecondary }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: colors.border }}>
                  {hallBookings
                    .filter((booking) => !booking.deleted)
                    .map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.guest?.firstName || "Unknown Guest"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.hall?.number || booking.hallId || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.eventType || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: colors.textPrimary }}>
                          {booking.bookingStatus || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                          <button
                            onClick={() => navigate(`/edit-booking/hall/${booking._id}`)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </button>
                          <div className="relative group">
                            <button className="text-green-600 hover:text-green-800 flex items-center">
                              Status
                            </button>
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md py-2 z-10">
                              {booking.bookingStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(booking._id, "approve", "hall")}
                                    className="block px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                  >
                                    <Check size={16} className="inline mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason = prompt("Enter rejection reason:");
                                      if (reason) handleStatusChange(booking._id, "reject", "hall", reason);
                                    }}
                                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <X size={16} className="inline mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this booking?")) {
                                    handleStatusChange(booking._id, "delete", "hall");
                                  }
                                }}
                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 w-full text-left"
                              >
                                <Trash size={16} className="inline mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AdminBookingsManage;


