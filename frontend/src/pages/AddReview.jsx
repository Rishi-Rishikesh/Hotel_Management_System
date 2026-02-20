import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { auth } from "../firebaseConfig";
import { useLocation, useNavigate } from "react-router-dom";

const AddReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const type = query.get("type");
  const itemId = query.get("itemId");
  const bookingId = query.get("bookingId");
  const edit = query.get("edit") === "true";
  const reviewId = query.get("reviewId");
  const existingReview = location.state?.review;

  const [formData, setFormData] = useState({
    userName: existingReview?.userName || "",
    rating: existingReview?.rating || 0,
    comment: existingReview?.comment || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!bookingId) {
        toast.error("Booking ID is required to submit a review");
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const payload = {
        itemId,
        type,
        userName: formData.userName,
        rating: formData.rating,
        comment: formData.comment,
        bookingId, // Must be a valid ObjectId
      };

      if (edit) {
        await axios.put(
          `http://localhost:4000/api/reviews/${reviewId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Review updated successfully");
      } else {
        await axios.post(
          "http://localhost:4000/api/reviews",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Review submitted successfully");
      }
      navigate("/guestdashboard");
    } catch (error) {
      console.error("Error submitting review:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">
        {edit ? "Edit Review" : "Add Review"} for {type === "hall" ? "Hall" : "Room"} {itemId}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rating</label>
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`cursor-pointer ${star <= formData.rating ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {edit ? "Update Review" : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default AddReview;