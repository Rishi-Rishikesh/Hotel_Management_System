import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-100 to-orange-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to Our Hotel System
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Please Sign Up or Log In to continue
      </p>

      <div className="space-x-4">
        <Link to="/signup">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Sign Up
          </button>
        </Link>
        <Link to="/login">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Log In
          </button>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
