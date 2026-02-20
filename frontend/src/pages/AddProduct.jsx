import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../firebaseConfig";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const params = new URLSearchParams(location.search);
          const type = params.get("type");
          const itemId = params.get("itemId");

          if (!type || !itemId || !["room", "hall"].includes(type)) {
            throw new Error("Invalid type or itemId");
          }

          const token = await user.getIdToken();
          const response = await axios.get(
            `http://localhost:4000/api/reviews/${type}/${itemId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setReviews(response.data.data || []);
          } else {
            setError(response.data.message || "Failed to load reviews");
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setError(error.response?.data?.message || "Failed to load reviews");
          toast.error(error.response?.data?.message || "Failed to load reviews");
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.error("Please log in");
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-orange-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-700 mb-6 text-center">
          Customer Reviews
        </h1>
        {isLoading ? (
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-blue-500 mx-auto"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
              ></path>
            </svg>
            <p className="mt-2 text-gray-700">Loading...</p>
          </div>
        ) : error ? (
          <p className="text-red-700 text-center">{error}</p>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2">{review.userName}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < review.rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No reviews yet for this item.</p>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/guestdashboard")}
            className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reviews;