import React, { useEffect, useState } from "react";
import axios from "axios";
import Cart from "./Cart";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Menu() {
  const [foodtype, setFoodType] = useState([]); // Always an array
  const [menu, setMenu] = useState([]);
  const [selectMenu, setSelectMenu] = useState([]);
  const [quantity, setQuantity] = useState({});
  const [isClicked, setIsClicked] = useState(false);
  const [orderFood, setOrderFood] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodtypeResponse = await axios.get(
          "http://localhost:4000/api/foodtype/getfoodtype"
        );

        if (!foodtypeResponse.data || !Array.isArray(foodtypeResponse.data)) {
          toast.error("❌ You have to register first !");
          setTimeout(() => navigate("/guestdashboard"), 2000);
          return;
        }
        setFoodType(foodtypeResponse.data); // Set only if it's an array

        const menuResponse = await axios.get(
          "http://localhost:4000/api/menu/getmenu"
        );

        if (!menuResponse.data || !Array.isArray(menuResponse.data)) {
          toast.error("❌ You have to register first !");
          setTimeout(() => navigate("/guestregistration"), 2000);
          return;
        }
        setMenu(menuResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("❌ Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, [navigate]);

  function handleFoodType(event) {
    const filteredMenu = menu.filter(
      (item) => item.type === event.target.value
    );
    setSelectMenu(filteredMenu);
    setIsClicked(true);
  }

  function changeQuantity(item, event) {
    const value = parseInt(event.target.value, 10) || 0;
    setQuantity((prevQuantity) => ({
      ...prevQuantity,
      [item.name]: value,
    }));
  }

  function handleSubmit(item) {
    if (!quantity[item.name] || quantity[item.name] < 1) {
      toast.error("Please enter a valid quantity (at least 1).");
      return;
    }

    setOrderFood((prevOrder) => [
      ...prevOrder,
      { name: item.name, price: item.price, quantity: quantity[item.name] },
    ]);

    setQuantity((prevQuantity) => ({
      ...prevQuantity,
      [item.name]: 0,
    }));
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center mb-6 text-gray-800">
        Menu For Breakfast, Lunch, and Dinner
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        {foodtype.length > 0 ? (
          foodtype.map((item) => (
            <button
              key={item.id || item.type}
              value={item.type}
              onClick={handleFoodType}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              {item.type}
            </button>
          ))
        ) : (
          <p className="text-red-500">No food types available.</p>
        )}
      </div>

      {isClicked && (
        <div className="space-y-4">
          {selectMenu.map((item) => (
            <div
              key={item.id || item.name}
              className="flex items-center justify-between bg-gray-100 rounded-lg p-4 shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-800 w-1/3">
                {item.name}
              </h2>
              <p className="text-lg font-semibold text-gray-700 w-1/3 text-center">
                Rs {item.price}
              </p>
              <div className="flex items-center w-1/3 justify-end">
                <label className="mr-2 text-gray-700">Qty</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity[item.name] || 0}
                  onChange={(e) => changeQuantity(item, e)}
                  className="w-16 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => handleSubmit(item)}
                className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all"
              >
                Order
              </button>
            </div>
          ))}
        </div>
      )}

      <Cart orderFood={orderFood} setOrderFood={setOrderFood} />
    </div>
  );
}

export default Menu;
