import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    rating: 0,
    comment: ""
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [reportType, setReportType] = useState("all");
  const [showReportOptions, setShowReportOptions] = useState(false);
  
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/reviews");
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
        setFilteredReviews(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredReviews(reviews);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = reviews.filter(review => {
      switch (searchFilter) {
        case "room":
          return review.roomId.toLowerCase().includes(term);
        case "guest":
          return review.userName.toLowerCase().includes(term);
        case "rating":
          return review.rating.toString() === term;
        case "comment":
          return review.comment.toLowerCase().includes(term);
        default:
          return (
            review.roomId.toLowerCase().includes(term) ||
            review.userName.toLowerCase().includes(term) ||
            review.rating.toString() === term ||
            review.comment.toLowerCase().includes(term)
          );
      }
    });
    
    setFilteredReviews(filtered);
  }, [searchTerm, searchFilter, reviews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "rating" ? parseInt(value, 10) : value
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setError(null);
  };

  const handleFilterChange = (e) => {
    setSearchFilter(e.target.value);
  };

  const handleEdit = (review) => {
    setEditingReview(review._id);
    setFormData({
      userName: review.userName,
      rating: review.rating,
      comment: review.comment
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setFormData({
      userName: "",
      rating: 0,
      comment: ""
    });
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!formData.userName.trim()) {
      setError("Please enter a guest name");
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${editingReview}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      const updatedReviews = reviews.map(review => 
        review._id === editingReview ? { ...review, ...formData } : review
      );
      
      setReviews(updatedReviews);
      setEditingReview(null);
      setFormData({ userName: "", rating: 0, comment: "" });
      setError(null);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteConfirm = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setReviewToDelete(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewToDelete}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      const updatedReviews = reviews.filter(review => review._id !== reviewToDelete);
      setReviews(updatedReviews);
      setShowConfirmation(false);
      setReviewToDelete(null);
      setError(null);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleReportOptions = () => {
    setShowReportOptions(!showReportOptions);
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const generatePdfReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Hotel Review Management Report", 14, 20);
    
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    doc.setFontSize(10);
    doc.text(`Generated on: ${today}`, 14, 26);

    let reportData = [...filteredReviews];

    if (reportType === "highRated") {
        reportData = reportData.filter(review => review.rating >= 4);
    } else if (reportType === "lowRated") {
        reportData = reportData.filter(review => review.rating <= 2);
    }

    let reportTypeText = "All Reviews";
    if (reportType === "highRated") reportTypeText = "High Rated Reviews (4-5 stars)";
    if (reportType === "lowRated") reportTypeText = "Low Rated Reviews (1-2 stars)";

    doc.setFontSize(12);
    doc.text(`Report Type: ${reportTypeText}`, 14, 34);
    doc.text(`Total Reviews: ${reportData.length}`, 14, 40);

    const avgRating = reportData.length > 0
    ? (reportData.reduce((sum, review) => sum + review.rating, 0) / reportData.length).toFixed(1)
    : "N/A";

    doc.text(`Average Rating: ${avgRating}`, 14, 46);

    const tableData = reportData.map(review => [
        review.roomId,
        review.userName,
        `${review.rating} ★`,
        review.comment.length > 50 ? review.comment.slice(0, 50) + "..." : review.comment,
        new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
    ]);

    autoTable(doc, {
        startY: 55,
        head: [["Room", "Guest", "Rating", "Comment", "Date"]],
        body: tableData,
        theme: "grid",
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: [255, 255, 255]
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
    });

    doc.save("hotel-reviews-report.pdf");
    setShowReportOptions(false);
  };

  const generateCsvReport = () => {
    let reportData = [...filteredReviews];

    if (reportType === "highRated") {
        reportData = reportData.filter(review => review.rating >= 4);
    } else if (reportType === "lowRated") {
        reportData = reportData.filter(review => review.rating <= 2);
    }

    let csvContent = "Room,Guest Name,Rating,Comment,Date\n";

    reportData.forEach(review => {
        const sanitizedComment = review.comment.replace(/"/g, '""');
        const row = [
            review.roomId,
            review.userName,
            review.rating,
            `"${sanitizedComment}"`,
            new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
        ].join(",");
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "hotel-reviews-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowReportOptions(false);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <span 
            key={index} 
            className={`text-xl ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-xl">Loading reviews...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-xl text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/room5.jpg')" }}>
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-600 to-gray-700 opacity-90 -z-10"></div>
      <div className="absolute inset-0 bg-black opacity-20 -z-10"></div>

      {/* Main content */}
      <div className="relative max-w-6xl mx-auto p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-xl shadow-2xl border border-white border-opacity-10">
        <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-md tracking-wider">
          Review Management
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex w-full max-w-2xl shadow-lg">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                aria-label="Search reviews"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <select 
                value={searchFilter}
                onChange={handleFilterChange}
                className="min-w-[140px] px-4 py-3 bg-white border-t border-r border-b border-gray-300 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                aria-label="Filter by"
              >
                <option value="all">All Fields</option>
                <option value="room">Room</option>
                <option value="guest">Guest Name</option>
                <option value="rating">Rating</option>
                <option value="comment">Comment</option>
              </select>
              <div className="pointer-events-none absolute right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Generate Report Button */}
          <div className="relative w-full md:w-auto">
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={toggleReportOptions}
              aria-label="Generate report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Generate Report
            </button>
            
            {showReportOptions && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-gray-800 bg-opacity-95 rounded-lg shadow-xl p-6 z-50 animate-fadeIn">
                <h3 className="text-lg font-medium text-white mb-4 text-center">Report Options</h3>
                <div className="mb-6">
                  <label className="block text-sm text-gray-300 mb-2">Report Type:</label>
                  <select 
                    value={reportType} 
                    onChange={handleReportTypeChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="all" className="bg-gray-800">All Reviews</option>
                    <option value="highRated" className="bg-gray-800">High Rated (4-5 ★)</option>
                    <option value="lowRated" className="bg-gray-800">Low Rated (1-2 ★)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <button 
                    className="w-full px-4 py-2 bg-gradient-to-br from-red-500 to-red-700 rounded text-white font-medium hover:from-red-600 hover:to-red-800 transition-all"
                    onClick={generatePdfReport}
                  >
                    Download PDF
                  </button>
                  <button 
                    className="w-full px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded text-white font-medium hover:from-blue-600 hover:to-blue-800 transition-all"
                    onClick={generateCsvReport}
                  >
                    Download CSV
                  </button>
                  <button 
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white font-medium hover:bg-gray-600 transition-all"
                    onClick={toggleReportOptions}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Results counter */}
        <div className="text-right text-sm text-gray-300 mb-4">
          {filteredReviews.length === reviews.length ? (
            <p>Displaying all {reviews.length} reviews</p>
          ) : (
            <p>Displaying {filteredReviews.length} of {reviews.length} reviews</p>
          )}
        </div>
        
        <div className="overflow-x-auto rounded-lg bg-white bg-opacity-5 shadow-md">
          <table className="w-full text-left" ref={tableRef}>
            <thead className="bg-black bg-opacity-20">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-white tracking-wider">Room</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-white tracking-wider">Guest Name</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-white tracking-wider">Rating</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-white tracking-wider">Comment</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-white tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold uppercase text-sm text-white tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr 
                    key={review._id} 
                    className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-all"
                  >
                    <td className="px-6 py-4 font-semibold text-blue-300">Room {review.roomId}</td>
                    <td className="px-6 py-4 font-medium">
                      {editingReview === review._id ? (
                        <input
                          type="text"
                          name="userName"
                          value={formData.userName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded text-gray-800"
                          aria-label="Guest name"
                        />
                      ) : (
                        review.userName
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingReview === review._id ? (
                        <select
                          name="rating"
                          value={formData.rating}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded text-gray-800"
                          aria-label="Rating"
                        >
                          <option value="1">1 Star</option>
                          <option value="2">2 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="5">5 Stars</option>
                        </select>
                      ) : (
                        renderStars(review.rating)
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {editingReview === review._id ? (
                        <textarea
                          name="comment"
                          value={formData.comment}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white bg-opacity-90 border border-gray-300 rounded text-gray-800 min-h-[80px]"
                          aria-label="Comment"
                        />
                      ) : (
                        review.comment
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 w-40">
                      {editingReview === review._id ? (
                        <div className="flex gap-2">
                          <button 
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </button>
                          <button 
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            onClick={() => handleEdit(review)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            onClick={() => handleDeleteConfirm(review._id)}
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
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400 italic">
                    No reviews found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 shadow-2xl border border-gray-600 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;