import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

function AddFeedback() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [feedbackType, setFeedbackType] = useState("");
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [typeErrorMessage, setTypeErrorMessage] = useState("");
  const [commentErrorMessage, setCommentErrorMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/guests/dashboard", {
        withCredentials: true,
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const commentRegex = /^[A-Za-z0-9\s.,!?'"()&:;-]{5,200}$/;

  function changeType(event) {
    setFeedbackType(event.target.value);
    setTypeErrorMessage(" ");
  }

  function changeComment(event) {
    setComment(event.target.value);
    setCommentErrorMessage(" ");
  }

  function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setEmailErrorMessage("");
    setTypeErrorMessage("");
    setCommentErrorMessage("");

    let isValid = true;

    if (comment.trim() === "") {
      setErrorMessage("Comment field is missing");
      isValid = false;
    }

    if (feedbackType === "") {
      setTypeErrorMessage(
        "❌ Invalid Feedback Type. Please select a valid Feedback type"
      );
      isValid = false;
    }

    // Validate comment format
    if (!commentRegex.test(comment)) {
      setCommentErrorMessage(
        "❌ Invalid Comment. Your comment must be between 5 to 200 characters."
      );
      isValid = false;
    }

    if (isValid) {
      const feedbackData = {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        feedbacktype: feedbackType,
        comment: comment,
      };

      axios
        .post(
          "http://localhost:4000/api/feedback/addfeedback",
          {
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            feedbacktype: feedbackType,
            comment: comment,
          },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data === true) {
            toast.success("Feedback submitted successfully!", {});
            navigate("/guestdashboard");
          } else {
            toast.error(response.data);
          }
        })
        .catch((error) => {
          setErrorMessage("There was an error submitting your feedback.");
          toast.error("Error submitting feedback.", {});
        });
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      {user.email && (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
            Share Your Feedback
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-red-700 text-center">{errorMessage}</p>

            <div>
              <label className="block text-gray-600 font-medium">
                First Name
              </label>
              <input
                type="text"
                name="fname"
                value={user.fname}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="lname"
                value={user.lname}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-red-700 text-sm">{emailErrorMessage}</p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium">
                Feedback Type
              </label>
              <select
                value={feedbackType}
                onChange={changeType}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled selected>
                  Select Feedback Type
                </option>
                <option value="Room&Amenities">Room and Amenities</option>
                <option value="Event&Amenities">Event and Amenities</option>
                <option value="Food&Dining">Food and Dining</option>
                <option value="RoomService">Room Service</option>
              </select>
              <p className="text-red-700 text-sm">{typeErrorMessage}</p>
            </div>

            <div>
              <label className="block text-gray-600 font-medium">
                Comments
              </label>
              <textarea
                name="comment"
                placeholder="Enter Your Comments Here"
                value={comment}
                onChange={changeComment}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <p className="text-red-700 text-sm">{commentErrorMessage}</p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition duration-300"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddFeedback;
