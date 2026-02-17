import React, { useEffect, useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

const BookingHistory = () => {
  const [roomBookings, setRoomBookings] = useState([]);
  const [hallBookings, setHallBookings] = useState([]);
  const [availableHalls, setAvailableHalls] = useState([]);
  const [roomSearch, setRoomSearch] = useState('');
  const [hallSearch, setHallSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        toast.error('Please log in to view your booking history. Redirecting to login...');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      try {
        await Promise.all([fetchBookings(), fetchHallBookings(), fetchAvailableHalls()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load booking data.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Helper function to parse response safely
  const parseResponse = async (response) => {
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `HTTP ${response.status}`;
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Unexpected response format: not JSON');
    }
    return response.json();
  };

  // Fetch room bookings
  const fetchBookings = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:4000/api/bookings/rooms/my-bookings', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const { success, data } = await parseResponse(response);
      if (!success) {
        throw new Error('API response unsuccessful');
      }
      setRoomBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching room bookings:', error);
      toast.error(`Failed to load room bookings: ${error.message}`);
    }
  };

  // Fetch hall bookings
  const fetchHallBookings = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:4000/api/bookings/halls/my', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const { success, bookings } = await parseResponse(response);
      if (!success) {
        throw new Error('API response unsuccessful');
      }
      setHallBookings(Array.isArray(bookings) ? bookings : []);
    } catch (error) {
      console.error('Error fetching hall bookings:', error);
      toast.error(`Failed to load hall bookings: ${error.message}`);
    }
  };

  // Fetch available halls for switching
  const fetchAvailableHalls = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('http://localhost:4000/api/halls/available', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { success, data } = await parseResponse(response);
      if (!success) {
        throw new Error('API response unsuccessful');
      }
      setAvailableHalls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching available halls:', error);
      toast.error(`Failed to load available halls: ${error.message}`);
      setAvailableHalls([]);
    }
  };

  // Check if editing is allowed (2-day rule, bypassed for completed bookings)
  const canEditBooking = (booking, type) => {
    if (booking.bookingStatus === 'completed') {
      return { allowed: true, message: '' };
    }
    const now = new Date();
    const twoDaysBefore = new Date(
      type === 'room' ? booking.checkInDate : booking.eventDate
    );
    twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
    if (now > twoDaysBefore) {
      return {
        allowed: false,
        message: `Cannot edit ${type} booking within 2 days of ${
          type === 'room' ? 'check-in' : 'event date'
        }.`,
      };
    }
    return { allowed: true, message: '' };
  };

  // Check if cancellation needs a warning
  const getCancellationWarning = (booking, type) => {
    const now = new Date();
    const thresholdDate = new Date(
      type === 'room' ? booking.checkInDate : booking.eventDate
    );
    const daysBefore = type === 'room' ? 1 : 2;
    thresholdDate.setDate(thresholdDate.getDate() - daysBefore);

    if (now > thresholdDate) {
      return `You are cancelling within ${daysBefore} day${daysBefore > 1 ? 's' : ''} of ${
        type === 'room' ? 'check-in' : 'event date'
      }. Are you sure?`;
    }
    return null;
  };

  // Handle edit button click
  const handleEdit = (booking, type) => {
    const { allowed, message } = canEditBooking(booking, type);
    if (!allowed) {
      toast.error(message);
      return;
    }
    setEditingId(booking._id);
    setEditFormData({ ...booking, bookingType: type });
  };

  // Handle booking cancellation
  const handleCancel = async (booking, type) => {
    const warningMessage = getCancellationWarning(booking, type);
    if (warningMessage && !window.confirm(warningMessage)) {
      return;
    }

    const endpoint =
      type === 'hall'
        ? `http://localhost:4000/api/bookings/halls/${booking._id}`
        : `http://localhost:4000/api/bookings/rooms/${booking._id}`;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingStatus: 'cancelled' }),
      });

      await parseResponse(response);

      if (type === 'hall') {
        setHallBookings(
          hallBookings.map((b) =>
            b._id === booking._id ? { ...b, bookingStatus: 'cancelled' } : b
          )
        );
      } else {
        setRoomBookings(
          roomBookings.map((b) =>
            b._id === booking._id ? { ...b, bookingStatus: 'cancelled' } : b
          )
        );
      }
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error, { response: error.message });
      toast.error(`Failed to cancel booking: ${error.message}`);
    }
  };

  // Handle deletion of cancelled or completed bookings
  const handleDelete = async (booking, type) => {
    if (booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed') {
      toast.error('Only cancelled or completed bookings can be deleted.');
      return;
    }
    const endpoint =
      type === 'hall'
        ? `http://localhost:4000/api/bookings/halls/${booking._id}`
        : `http://localhost:4000/api/bookings/rooms/${booking._id}`;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await parseResponse(response);

      if (type === 'hall') {
        setHallBookings(hallBookings.filter((b) => b._id !== booking._id));
      } else {
        setRoomBookings(roomBookings.filter((b) => b._id !== booking._id));
      }
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error(`Failed to delete booking: ${error.message}`);
    }
  };

  // Handle save after editing
  const handleSave = async (id, type) => {
    const endpoint =
      type === 'hall'
        ? `http://localhost:4000/api/bookings/halls/${id}`
        : `http://localhost:4000/api/bookings/rooms/${id}`;
    try {
      const token = await auth.currentUser.getIdToken();

      // For hall bookings, validate guest count against hall capacity
      if (type === 'hall') {
        const selectedHall = availableHalls.find(
          (hall) => hall.number === editFormData.hall?.number || editFormData.hallId
        );
        if (selectedHall && editFormData.numberOfGuests > selectedHall.capacity) {
          toast.error(
            `Guest count (${editFormData.numberOfGuests}) exceeds hall capacity (${selectedHall.capacity}). Please select another hall.`
          );
          return;
        }
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const { data } = await parseResponse(response);

      if (type === 'hall') {
        setHallBookings(hallBookings.map((b) => (b._id === id ? data : b)));
      } else {
        setRoomBookings(roomBookings.map((b) => (b._id === id ? data : b)));
      }
      setEditingId(null);
      setEditFormData({});
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(`Failed to update booking: ${error.message}`);
    }
  };

  // Handle input changes during editing
  const handleInputChange = (e, field) => {
    setEditFormData({
      ...editFormData,
      [field]: e.target.value,
    });
  };

  // Handle hall selection for switching
  const handleHallChange = (e) => {
    const hallNumber = e.target.value;
    setEditFormData({
      ...editFormData,
      hall: { number: hallNumber },
      hallId: hallNumber,
    });
  };

  // Filter bookings based on search
  const filteredRoomBookings = Array.isArray(roomBookings)
    ? roomBookings.filter((booking) =>
        Object.values(booking).some((value) =>
          String(value).toLowerCase().includes(roomSearch.toLowerCase())
        )
      )
    : [];
  const filteredHallBookings = Array.isArray(hallBookings)
    ? hallBookings.filter((booking) =>
        Object.values(booking).some((value) =>
          String(value).toLowerCase().includes(hallSearch.toLowerCase())
        )
      )
    : [];

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Booking History Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Room Bookings Table
    doc.setFontSize(14);
    doc.text('Room Bookings', 14, 40);
    autoTable(doc, {
      startY: 45,
      head: [['#', 'Check In', 'Check Out', 'Room', 'Status']],
      body: roomBookings.map((booking, index) => [
        index + 1,
        new Date(booking.checkInDate).toLocaleDateString(),
        new Date(booking.checkOutDate).toLocaleDateString(),
        booking.roomNumber,
        booking.bookingStatus,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Hall Bookings Table
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Hall Bookings', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['#', 'Event Date', 'Hall', 'Event Type', 'Guests', 'Status']],
      body: hallBookings.map((booking, index) => [
        index + 1,
        new Date(booking.eventDate).toLocaleDateString(),
        booking.hall?.number || booking.hallId || 'N/A',
        booking.eventType,
        booking.numberOfGuests,
        booking.bookingStatus,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('Booking_History_Report.pdf');
    toast.success('PDF report generated successfully');
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    const userRole = auth.currentUser?.role || 'User';
    navigate(userRole === 'Admin' ? '/admin-dashboard' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          </div>
          <button
            onClick={generatePDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Generate PDF</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="space-y-12">
            {/* Room Bookings Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Room Bookings</h2>
                <div className="mt-4 flex items-center max-w-md">
                  <Search className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Search room bookings..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium uppercase">#</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Check In</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Check Out</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Room</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Status</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoomBookings.length > 0 ? (
                      filteredRoomBookings.map((booking, index) => (
                        <tr
                          key={booking._id}
                          className={clsx(
                            'border-b border-gray-200 hover:bg-blue-50 transition-colors',
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          )}
                        >
                          <td className="p-4">{index + 1}</td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <input
                                type="date"
                                value={editFormData.checkInDate?.split('T')[0] || ''}
                                onChange={(e) => handleInputChange(e, 'checkInDate')}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              new Date(booking.checkInDate).toLocaleDateString()
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <input
                                type="date"
                                value={editFormData.checkOutDate?.split('T')[0] || ''}
                                onChange={(e) => handleInputChange(e, 'checkOutDate')}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              new Date(booking.checkOutDate).toLocaleDateString()
                            )}
                          </td>
                          <td className="p-4">{booking.roomNumber}</td>
                          <td
                            className={clsx(
                              'p-4 font-medium',
                              {
                                'text-green-600': booking.bookingStatus === 'confirmed',
                                'text-yellow-600': booking.bookingStatus === 'pending',
                                'text-red-600': booking.bookingStatus === 'cancelled',
                                'text-blue-600': booking.bookingStatus === 'completed',
                              }
                            )}
                          >
                            {booking.bookingStatus}
                          </td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSave(booking._id, 'room')}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  className={clsx(
                                    'px-4 py-2 rounded-lg transition-colors',
                                    booking.bookingStatus === 'cancelled'
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  )}
                                  onClick={() => handleEdit(booking, 'room')}
                                  disabled={booking.bookingStatus === 'cancelled'}
                                >
                                  Edit
                                </button>
                                <button
                                  className={clsx(
                                    'px-4 py-2 rounded-lg transition-colors',
                                    booking.bookingStatus === 'cancelled'
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  )}
                                  onClick={() => handleCancel(booking, 'room')}
                                  disabled={booking.bookingStatus === 'cancelled'}
                                >
                                  Cancel
                                </button>
                                <button
                                  className={clsx(
                                    'px-4 py-2 rounded-lg transition-colors',
                                    booking.bookingStatus === 'cancelled' ||
                                      booking.bookingStatus === 'completed'
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  )}
                                  onClick={() => handleDelete(booking, 'room')}
                                  disabled={
                                    booking.bookingStatus !== 'cancelled' &&
                                    booking.bookingStatus !== 'completed'
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-600">
                          No room bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hall Bookings Section */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Hall Bookings</h2>
                <div className="mt-4 flex items-center max-w-md">
                  <Search className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Search hall bookings..."
                    value={hallSearch}
                    onChange={(e) => setHallSearch(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium uppercase">#</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Event Date</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Hall</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Event Type</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Guests</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Status</th>
                      <th className="p-4 text-left text-sm font-medium uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHallBookings.length > 0 ? (
                      filteredHallBookings.map((booking, index) => (
                        <tr
                          key={booking._id}
                          className={clsx(
                            'border-b border-gray-200 hover:bg-blue-50 transition-colors',
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          )}
                        >
                          <td className="p-4">{index + 1}</td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <input
                                type="date"
                                value={editFormData.eventDate?.split('T')[0] || ''}
                                onChange={(e) => handleInputChange(e, 'eventDate')}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              new Date(booking.eventDate).toLocaleDateString()
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <select
                                value={editFormData.hall?.number || editFormData.hallId || ''}
                                onChange={handleHallChange}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Hall</option>
                                {availableHalls.map((hall) => (
                                  <option key={hall._id} value={hall.number}>
                                    {hall.number} (Capacity: {hall.capacity})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              booking.hall?.number || booking.hallId || 'N/A'
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <input
                                type="text"
                                value={editFormData.eventType || ''}
                                onChange={(e) => handleInputChange(e, 'eventType')}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              booking.eventType
                            )}
                          </td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <input
                                type="number"
                                value={editFormData.numberOfGuests || ''}
                                onChange={(e) => handleInputChange(e, 'numberOfGuests')}
                                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              booking.numberOfGuests
                            )}
                          </td>
                          <td
                            className={clsx(
                              'p-4 font-medium',
                              {
                                'text-green-600': booking.bookingStatus === 'confirmed',
                                'text-yellow-600': booking.bookingStatus === 'pending',
                                'text-red-600': booking.bookingStatus === 'cancelled',
                                'text-blue-600': booking.bookingStatus === 'completed',
                              }
                            )}
                          >
                            {booking.bookingStatus}
                          </td>
                          <td className="p-4">
                            {editingId === booking._id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSave(booking._id, 'hall')}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  className={clsx(
                                    'px-4 py-2 rounded-lg transition-colors',
                                    booking.bookingStatus === 'cancelled'
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  )}
                                  onClick={() => handleEdit(booking, 'hall')}
                                  disabled={booking.bookingStatus === 'cancelled'}
                                >
                                  Edit
                                </button>
                                <button
                                  className={clsx(
                                    'px-4 py-2 rounded-lg transition-colors',
                                    booking.bookingStatus === 'cancelled'
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  )}
                                  onClick={() => handleCancel(booking, 'hall')}
                                  disabled={booking.bookingStatus === 'cancelled'}
                                >
                                  Cancel
                                </button>
                                <button
                                  className={clsx(
                                    'px-4 py-2 rounded-lg transition-colors',
                                    booking.bookingStatus === 'cancelled' ||
                                      booking.bookingStatus === 'completed'
                                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  )}
                                  onClick={() => handleDelete(booking, 'hall')}
                                  disabled={
                                    booking.bookingStatus !== 'cancelled' &&
                                    booking.bookingStatus !== 'completed'
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-600">
                          No hall bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;