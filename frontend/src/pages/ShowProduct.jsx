import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ShowProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/inventory/getproducts")
      .then((response) => {
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError("No products found");
        }
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
        setError("Failed to fetch products. Please try again later.");
      });
  }, []);

  function addProduct() {
    navigate("/addproduct");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="container max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Products
        </h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={addProduct}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-transform transform hover:bg-blue-400 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Add Product
          </button>
        </div>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse bg-gray-100 rounded-lg">
            <thead>
              <tr className="text-left bg-blue-500 text-white">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index} className="text-gray-700 hover:bg-gray-200">
                    <td className="px-6 py-3">{product.pname}</td>
                    <td className="px-6 py-3">{product.category}</td>
                    <td className="px-6 py-3">{product.description}</td>
                    <td className="px-6 py-3">{product.stock}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShowProduct;
