import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../firebaseConfig";

const RoomReview = () => {
  const { itemId } = useParams();
  const { state } = useLocation();
  const bookingId = state?.bookingId;
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await axios.get(`http://localhost:4000/api/reviews/room/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success) {
            setReviews(response.data.data);
          } else {
            toast.error("Failed to load reviews");
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
          toast.error("Error fetching reviews");
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Please log in");
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [itemId, navigate]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!bookingId) {
      toast.error("No valid booking found");
      return;
    }
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `http://localhost:4000/api/reviews`,
        {
          itemId,
          type: "room",
          userId: auth.currentUser.uid,
          userName: auth.currentUser.displayName || "Guest",
          rating: newReview.rating,
          comment: newReview.comment,
          bookingId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setReviews([...reviews, response.data.data]);
        setNewReview({ rating: 0, comment: "" });
        toast.success("Review added successfully");
      } else {
        toast.error("Failed to add review");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Error adding review");
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.put(
        `http://localhost:4000/api/reviews/${editingReview._id}`,
        {
          userId: auth.currentUser.uid,
          rating: editRating,
          comment: editComment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setReviews(
          reviews.map((r) =>
            r._id === editingReview._id ? { ...r, rating: editRating, comment: editComment } : r
          )
        );
        setEditingReview(null);
        toast.success("Review updated successfully");
      } else {
        toast.error("Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Error updating review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.delete(`http://localhost:4000/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId: auth.currentUser.uid },
        });
        if (response.data.success) {
          setReviews(reviews.filter((r) => r._id !== reviewId));
          toast.success("Review deleted successfully");
        } else {
          toast.error("Failed to delete review");
        }
      } catch (error) {
        console.error("Error deleting review:", error);
          toast.error("Error deleting review");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-100 p-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reviews for Room {itemId}</h1>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Your Review</h3>
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-gray-700">Rating</label>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  onClick={() => setNewReview({ ...newReview, rating: index + 1 })}
                  style={{
                    cursor: "pointer",
                    color: index < newReview.rating ? "yellow" : "gray",
                    fontSize: "30px",
                  }}
                >
                  <FontAwesomeIcon icon={faStar} />
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Comment</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Submit Review
          </button>
        </form>
      </div>
      {isLoading ? (
        <div className="text-center py-10">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
          </svg>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow-md">
              {editingReview && editingReview._id === review._id ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Rating</label>
                    <div className="flex space-x-2">
                      {[...Array(5)].map((_, index) => (
                        <span
                          key={index}
                          onClick={() => setEditRating(index + 1)}
                          style={{
                            cursor: "pointer",
                            color: index < editRating ? "yellow" : "gray",
                            fontSize: "30px",
                          }}
                        >
                          <FontAwesomeIcon icon={faStar} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700">Comment</label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReview(null)}
                      className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          color={i < review.rating ? "yellow" : "gray"}
                        />
                      ))}
                    </div>
                    <p>{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {review.userId === auth.currentUser?.uid && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No reviews yet. Be the first to share your experience!</p>
      )}
    </motion.div>
  );
};

export default RoomReview;