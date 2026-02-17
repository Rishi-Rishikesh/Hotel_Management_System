import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

function ShowReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/review/getreviews")
      .then((response) => {
        if (response.data.success === true) {
          setReviews(response.data.reviews);
          setLoading(false);
        } else {
          console.log("No reviews found");
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setError("Failed to fetch reviews. Please try again later.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">
        Customer Reviews
      </h1>
      {loading && <p>Loading reviews...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="w-full max-w-3xl space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white p-4 shadow-md rounded-lg border border-gray-300"
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {review.name}
              </h2>
              <p className="text-sm text-gray-500">{review.address}</p>
              <div className="flex items-center my-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={
                      i < review.star ? "text-yellow-500" : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
}

export default ShowReview;
