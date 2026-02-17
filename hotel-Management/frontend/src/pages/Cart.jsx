import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { auth } from '../firebaseConfig.js';
import {
  FaShoppingCart,
  FaMinus,
  FaPlus,
  FaTrash,
  FaClock,
  FaUtensils,
  FaBoxOpen,
  FaHistory,
  FaFilePdf,
  FaBell,
  FaEdit,
  FaTimesCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import { GiMeal } from 'react-icons/gi';
import defaultImage from '../assets/defaultImage.jpg';

// Axios instance for API calls
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

// CartItem component for displaying items in the cart
const CartItem = ({ item, updateCartQuantity, removeFromCart }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-orange-100"
    whileHover={{ y: -3 }}
    role="listitem"
  >
    <div className="flex items-center space-x-4">
      <img
        src={item.image || defaultImage}
        alt={item.name}
        className="w-16 h-16 object-cover rounded-xl"
        onError={(e) => (e.target.src = defaultImage)}
      />
      <div>
        <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
        <p className="text-gray-500 text-sm">LKR {item.price.toFixed(0)} each</p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-inner">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateCartQuantity(item.id, -1)}
          className="bg-gray-100 text-gray-700 p-2 rounded-l-full hover:bg-gray-200 transition-colors"
          aria-label={`Decrease quantity of ${item.name}`}
        >
          <FaMinus className="text-xs" />
        </motion.button>
        <span className="px-3 text-sm font-medium text-gray-900 min-w-[20px] text-center">
          {item.quantity}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateCartQuantity(item.id, 1)}
          className="bg-gray-100 text-gray-700 p-2 rounded-r-full hover:bg-gray-200 transition-colors"
          aria-label={`Increase quantity of ${item.name}`}
        >
          <FaPlus className="text-xs" />
        </motion.button>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => removeFromCart(item.id)}
        className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
        aria-label={`Remove ${item.name} from cart`}
      >
        <FaTrash />
      </motion.button>
    </div>
  </motion.div>
);

// OrderItem component for displaying past orders
const OrderItem = ({ order, generatePDF, updateOrder, cancelOrder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState(order.items || []);
  const [editedDeliveryTime, setEditedDeliveryTime] = useState(order.deliveryTime || '');

  console.log('OrderItem: Rendering order:', {
    id: order._id,
    status: order.status,
    items: order.items,
    totalPrice: order.totalPrice,
    deliveryTime: order.deliveryTime,
    createdAt: order.createdAt,
  });

  const handleUpdate = async () => {
    if (!editedDeliveryTime) {
      toast.error('Please select a delivery time.');
      return;
    }
    if (editedItems.length === 0) {
      toast.error('At least one item is required.');
      return;
    }

    const now = new Date();
    const selectedTime = new Date(`${now.toDateString()} ${editedDeliveryTime}`);
    const timeDiff = (selectedTime - now) / (1000 * 60);
    if (timeDiff < 10) {
      toast.error('Delivery time must be at least 10 minutes from now.');
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      const totalPrice = editedItems.reduce((total, item) => total + item.price * item.quantity, 0);
      await updateOrder(order._id, {
        items: editedItems,
        totalPrice,
        deliveryTime: editedDeliveryTime,
      }, idToken);
      setIsEditing(false);
      toast.success('Order updated successfully!');
    } catch (error) {
      console.error('OrderItem handleUpdate: Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update order.');
    }
  };

  const updateItemQuantity = (itemId, delta) => {
    setEditedItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="border border-orange-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
      role="listitem"
    >
      <div className="bg-orange-50/50 p-4 border-b border-orange-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              Order #{order._id?.slice(-6).toUpperCase() || 'UNKNOWN'}
            </p>
            <p className="text-sm text-gray-500">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </p>
            <p className="text-sm font-medium text-orange-600">Status: {order.status || 'N/A'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Scheduled for</p>
              <p className="font-medium text-orange-600">{order.deliveryTime || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-bold text-gray-900">
                LKR {order.totalPrice?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generatePDF(order, true, order._id)}
                className="bg-white text-orange-600 py-2 px-4 rounded-xl shadow-md flex items-center"
                aria-label={`Download bill for order ${order._id?.slice(-6).toUpperCase() || 'UNKNOWN'}`}
              >
                <FaFilePdf className="mr-2" />
                Bill
              </motion.button>
              {['Pending', 'Confirmed'].includes(order.status) && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white text-blue-600 py-2 px-4 rounded-xl shadow-md flex items-center"
                    aria-label={`Edit order ${order._id?.slice(-6).toUpperCase() || 'UNKNOWN'}`}
                  >
                    <FaEdit className="mr-2" />
                    {isEditing ? 'Cancel Edit' : 'Edit'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cancelOrder(order._id)}
                    className="bg-white text-red-600 py-2 px-4 rounded-xl shadow-md flex items-center"
                    aria-label={`Cancel order ${order._id?.slice(-6).toUpperCase() || 'UNKNOWN'}`}
                  >
                    <FaTimesCircle className="mr-2" />
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            {editedItems.map((item, idx) => (
              <div
                key={`${order._id}-${item.id}-${idx}`}
                className="flex justify-between items-center py-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image || defaultImage}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => (e.target.src = defaultImage)}
                  />
                  <div>
                    <p className="text-gray-800 font-medium">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      LKR {item.price?.toFixed(0) || '0'} × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateItemQuantity(item.id, -1)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <FaMinus />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateItemQuantity(item.id, 1)}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <FaPlus />
                  </motion.button>
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
              <input
                type="time"
                value={editedDeliveryTime}
                onChange={(e) => setEditedDeliveryTime(e.target.value)}
                className="border border-orange-200 rounded-xl p-2 w-full"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdate}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-4 rounded-xl w-full"
            >
              Save Changes
            </motion.button>
          </div>
        ) : (
          (order.items || []).map((item, idx) => (
            <motion.div
              key={`${order._id}-${item.id}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex justify-between items-center py-3 border-b border-orange-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={item.image || defaultImage}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                  onError={(e) => (e.target.src = defaultImage)}
                />
                <div>
                  <p className="text-gray-800 font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm">
                    LKR {item.price?.toFixed(0) || '0'} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-gray-800 font-medium">
                LKR {(item.price * item.quantity)?.toFixed(0) || '0'}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// NotificationItem component for displaying notifications
const NotificationItem = ({ notification, markAsRead }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className={`p-4 rounded-xl border flex justify-between items-center ${
      notification.isRead ? 'bg-gray-100' : 'bg-orange-50'
    }`}
  >
    <div>
      <p className="text-sm text-gray-800">{notification.message}</p>
      <p className="text-xs text-gray-500">
        {new Date(notification.createdAt).toLocaleString()}
      </p>
    </div>
    {!notification.isRead && (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => markAsRead(notification._id)}
        className="p-2 bg-orange-500 text-white rounded-full"
      >
        <FaBell />
      </motion.button>
    )}
  </motion.div>
);

// Main Cart component
const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    console.log('Cart: Initializing cart from localStorage:', savedCart);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chosenTime, setChosenTime] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Update cart from location state if provided
  useEffect(() => {
    if (location.state?.cart) {
      setCart(location.state.cart);
      localStorage.setItem('cart', JSON.stringify(location.state.cart));
    }
  }, [location.state]);

  // Save cart to localStorage
  useEffect(() => {
    console.log('Cart: Saving cart to localStorage:', cart);
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch user orders
  const fetchOrders = async (idToken, retries = 2, delay = 1000) => {
    try {
      console.log(`fetchOrders: Sending GET /api/orders with token: ${idToken.slice(0, 10)}...`);
      const response = await api.get('/api/orders', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log('fetchOrders: Response:', response.data);
      if (response.data.success && Array.isArray(response.data.orders)) {
        setOrders([...response.data.orders]);
        console.log('fetchOrders: Set orders:', response.data.orders);
        if (response.data.orders.length === 0) {
          console.log('fetchOrders: No orders found for user.');
          toast.info('No past orders found.');
        }
      } else {
        console.warn('fetchOrders: Invalid response format:', response.data);
        toast.error('Failed to load orders: Invalid response.');
      }
    } catch (error) {
      console.error('fetchOrders: Error:', error.response?.data || error.message);
      if (retries > 0 && error.response?.status === 500) {
        console.log(`fetchOrders: Retrying (${retries} retries left)...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchOrders(idToken, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Fetch user notifications
  const fetchNotifications = async (idToken, retries = 2, delay = 1000) => {
    try {
      console.log(`fetchNotifications: Sending GET /api/orders/notifications with token: ${idToken.slice(0, 10)}...`);
      const response = await api.get('/api/orders/notifications', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log('fetchNotifications: Response:', response.data);
      if (response.data.success && Array.isArray(response.data.notifications)) {
        setNotifications([...response.data.notifications]);
        console.log('fetchNotifications: Notifications set:', response.data.notifications);
        if (response.data.notifications.length === 0) {
          console.log('fetchNotifications: No notifications found for user.');
          toast.info('No notifications found.');
        }
      } else {
        console.warn('fetchNotifications: Invalid response format:', response.data);
        toast.warn('Failed to load notifications: Invalid response.');
      }
    } catch (error) {
      console.error('fetchNotifications: Error:', error.response?.data || error.message);
      if (retries > 0 && error.response?.status === 500) {
        console.log(`fetchNotifications: Retrying (${retries} retries left)...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchNotifications(idToken, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Fetch user data and initialize orders/notifications
  const fetchUserData = async () => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.log('fetchUserData: No Firebase user. Redirecting to login.');
        toast.error('Please log in to view your cart.');
        navigate('/login');
        return;
      }

      const idToken = await firebaseUser.getIdToken(true);
      console.log('fetchUserData: idToken:', idToken.slice(0, 10) + '...');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (!userData?._id || !/^[0-9a-fA-F]{24}$/.test(userData._id)) {
        console.log('fetchUserData: Invalid user ID:', userData._id);
        localStorage.removeItem('user');
        toast.error('Invalid user data. Please log in again.');
        navigate('/login');
        return;
      }

      setUser(userData);
      console.log('fetchUserData: Fetching orders and notifications...');
      await Promise.all([fetchOrders(idToken), fetchNotifications(idToken)]);
    } catch (error) {
      console.error('fetchUserData: Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to load cart data.';
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('User not registered. Please log in again or contact support.');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize user data on mount
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchUserData();
    }
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Update cart quantity
  const updateCartQuantity = useCallback((itemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast.success('Item removed from cart.');
  }, []);

  // Update an existing order
  const updateOrder = async (orderId, orderData, idToken) => {
    try {
      console.log('updateOrder: Updating order:', orderId, orderData);
      const response = await api.put(`/api/orders/${orderId}`, orderData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log('updateOrder: Response:', response.data);
      if (response.data.success && response.data.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...response.data.order } : order
          )
        );
        await fetchNotifications(idToken);
      } else {
        throw new Error(response.data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('updateOrder: Error:', error.response?.data || error.message);
      throw error;
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log('cancelOrder: Cancelling order:', orderId);

      const order = orders.find((o) => o._id === orderId);
      if (order && order.deliveryTime) {
        const now = new Date();
        const deliveryTime = new Date(`${now.toDateString()} ${order.deliveryTime}`);
        const timeDiff = (deliveryTime - now) / (1000 * 60);
        if (timeDiff < 10) {
          await api.post(
            '/api/admin/notify',
            {
              message: `User ${user?.fname || 'Guest'} ${user?.lname || ''} cancelled order #${orderId.slice(-6).toUpperCase()} with delivery time ${order.deliveryTime} (< 10 min away).`,
              type: 'OrderCancellation',
            },
            { headers: { Authorization: `Bearer ${idToken}` } }
          );
        }
      }

      const response = await api.delete(`/api/orders/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log('cancelOrder: Response:', response.data);
      if (response.data.success && response.data.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: 'Cancelled' } : order
          )
        );
        await fetchNotifications(idToken);
        toast.success('Order cancelled successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('cancelOrder: Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order.';
      toast.error(errorMessage);
    }
  };

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log('markNotificationAsRead: Marking notification:', notificationId);
      const response = await api.patch(`/api/orders/notifications/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log('markNotificationAsRead: Response:', response.data);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        toast.success('Notification marked as read.');
      }
    } catch (error) {
      console.error('markNotificationAsRead: Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to mark notification as read.';
      toast.error(errorMessage);
    }
  };

  // Handle logout and redirect to dashboard
  const handleLogout = async () => {
    try {
      toast.success('Navigating to Dashboard.');
      navigate('/guestdashboard');
    } catch (error) {
      console.error('handleLogout: Error:', error.message);
      toast.error('Failed to navigate to dashboard.');
    }
  };

  // Calculate total price of cart
  const getTotalPrice = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(0),
    [cart]
  );

  // Generate PDF bill
  const generatePDF = useCallback(
    (order, isPastOrder = false, orderId = null) => {
      try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(234, 88, 12);
        doc.text('Anuthama Villa - Order Bill', 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Order #${orderId ? orderId.slice(-6).toUpperCase() : 'CURRENT'}`, 20, 30);
        doc.text(`Customer: ${user?.fname || 'Guest'} ${user?.lname || ''}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        if (isPastOrder) {
          doc.text(`Ordered on: ${new Date(order.createdAt).toLocaleString()}`, 20, 60);
          doc.text(`Delivery Time: ${order.deliveryTime || 'N/A'}`, 20, 70);
          doc.text(`Status: ${order.status || 'N/A'}`, 20, 80);
        } else {
          doc.text(`Delivery Time: ${chosenTime || 'Not specified'}`, 20, 60);
        }
        doc.text(`Payment Method: Cash on Delivery`, 20, isPastOrder ? 90 : 70);

        doc.setLineWidth(0.5);
        doc.setDrawColor(234, 88, 12);
        doc.line(20, isPastOrder ? 95 : 85, 190, isPastOrder ? 95 : 85);

        doc.setFontSize(10);
        let y = isPastOrder ? 105 : 95;
        doc.text('Item', 20, y);
        doc.text('Qty', 120, y);
        doc.text('Price (LKR)', 150, y);
        doc.text('Total (LKR)', 180, y);

        y += 5;
        doc.line(20, y, 190, y);
        y += 10;

        const items = isPastOrder ? order.items || [] : order;
        items.forEach((item) => {
          const itemName = item.name || 'Unknown Item';
          const itemNameLines = doc.splitTextToSize(itemName, 90);
          itemNameLines.forEach((line, index) => {
            doc.text(line, 20, y + index * 5);
          });
          doc.text((item.quantity || 0).toString(), 120, y);
          doc.text(`LKR ${(item.price || 0).toFixed(0)}`, 150, y);
          doc.text(`LKR ${((item.price || 0) * (item.quantity || 0)).toFixed(0)}`, 180, y);
          y += Math.max(itemNameLines.length * 5, 10);
        });

        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(234, 88, 12);
        doc.text(
          `Total: LKR ${isPastOrder ? (order.totalPrice || 0).toFixed(0) : getTotalPrice}`,
          150,
          y
        );

        doc.save(`order_${orderId || 'current'}_${user?.fname || 'guest'}.pdf`);
      } catch (error) {
        console.error('generatePDF: Error:', error.message);
        toast.error('Failed to generate bill.');
      }
    },
    [user, chosenTime, getTotalPrice]
  );

  // Place a new order
  const placeOrder = async () => {
    if (cart.length === 0) {
      setOrderStatus('Cart is empty!');
      toast.error('Cart is empty.');
      return;
    }
    if (!chosenTime || !/^\d{2}:\d{2}$/.test(chosenTime)) {
      setOrderStatus('Please select a valid delivery time!');
      toast.error('Please select a valid delivery time.');
      return;
    }

    // Validate delivery time is at least 10 minutes in the future
    const now = new Date();
    const selectedTime = new Date(`${now.toDateString()} ${chosenTime}`);
    const timeDiff = (selectedTime - now) / (1000 * 60);
    if (timeDiff < 10) {
      setOrderStatus('Delivery time must be at least 10 minutes from now.');
      toast.error('Delivery time must be at least 10 minutes from now.');
      return;
    }

    if (!auth.currentUser) {
      setOrderStatus('You must be logged in to place an order.');
      toast.error('Please log in to place your order.');
      navigate('/login');
      return;
    }

    setOrderStatus('Placing order...');
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log('placeOrder: idToken:', idToken.slice(0, 10) + '...');
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.description || '',
          mealType: item.mealType || '',
          category: item.category || '',
        })),
        totalPrice: parseFloat(getTotalPrice),
        deliveryTime: chosenTime,
      };

      console.log('placeOrder: Sending order:', orderData);
      const response = await api.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      console.log('placeOrder: Response:', response.data);

      if (response.data.success && response.data.order) {
        setOrderStatus(
          `Order placed successfully for ${chosenTime}! 🎉 Download your bill below.`
        );
        toast.success('Order placed successfully!');
        generatePDF(cart, false, response.data.order._id);
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
        setChosenTime('');
        await Promise.all([fetchOrders(idToken), fetchNotifications(idToken)]);
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('placeOrder: Error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.map((e) => e.msg).join(', ') ||
        'Failed to place order. Please try again.';
      if (error.response?.status === 401) {
        setOrderStatus('Unauthorized: Please log in again.');
        toast.error('Unauthorized: Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setOrderStatus('User not registered. Please log in again.');
        toast.error('User not registered. Please log in again.');
        navigate('/login');
      } else {
        setOrderStatus(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  console.log('Cart: Rendering with cart:', cart, 'orders:', orders);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-20 w-20 border-4 border-t-orange-500 border-r-amber-400 border-b-orange-300 border-l-amber-200 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-blue-500 text-white py-2 px-4 rounded-xl shadow-md flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Go to Dashboard
            </motion.button>
          </div>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                Your Cart,
              </span>
              <span className="block text-5xl md:text-6xl font-extrabold mt-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {user.fname}!
              </span>
            </h1>
            <p className="text-lg text-gray-600 mt-6">
              Review and place your order
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="mb-12"
          >
            <motion.div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaBell className="mr-3 text-orange-500" />
                  Notifications
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-orange-100/50 px-3 py-1 rounded-full">
                  {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
                </span>
              </div>
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FaBell className="mx-auto text-5xl text-orange-300 mb-4" />
                    <h4 className="text-xl font-medium text-gray-700 mb-3">
                      No notifications
                    </h4>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      Order updates will appear here
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        markAsRead={markNotificationAsRead}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            id="current-order"
            className="mb-16"
          >
            <motion.div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaShoppingCart className="mr-3 text-orange-500" />
                  Your Current Order
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-orange-100/50 px-3 py-1 rounded-full">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <FaBoxOpen className="mx-auto text-5xl text-orange-300 mb-4" />
                    <h4 className="text-xl font-medium text-gray-700 mb-3">
                      Your cart is empty
                    </h4>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      Add items from our menu!
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/foodordering')}
                      className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 px-6 rounded-xl shadow-md"
                    >
                      Browse Menu
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        updateCartQuantity={updateCartQuantity}
                        removeFromCart={removeFromCart}
                      />
                    ))}
                    <motion.div className="mt-8 bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="bg-orange-100 p-3 rounded-full">
                              <FaClock className="text-orange-600 text-xl" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delivery Time
                              </label>
                              <input
                                type="time"
                                value={chosenTime}
                                onChange={(e) => setChosenTime(e.target.value)}
                                className="border border-orange-200 rounded-xl p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors bg-white shadow-sm w-full"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="text-2xl font-bold text-orange-600">
                                LKR {getTotalPrice}
                              </p>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={placeOrder}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center"
                        >
                          <FaUtensils className="mr-2" />
                          Place Order
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          {orderStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 rounded-2xl shadow-md text-center text-gray-800 border border-orange-200 mb-12"
            >
              <p className="text-lg font-medium">{orderStatus}</p>
              {orderStatus.includes('Order placed successfully') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => generatePDF(cart, false)}
                  className="mt-4 bg-white text-orange-600 py-2 px-4 rounded-xl shadow-md flex items-center mx-auto"
                >
                  <FaFilePdf className="mr-2" />
                  Download Bill
                </motion.button>
              )}
            </motion.div>
          )}

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
            className="mb-12"
          >
            <motion.div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-orange-100 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FaHistory className="mr-3 text-orange-500" />
                  Your Past Orders
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-orange-100/50 px-3 py-1 rounded-full">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
              <AnimatePresence>
                {orders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <GiMeal className="mx-auto text-5xl text-orange-300 mb-4" />
                    <h4 className="text-xl font-medium text-gray-700 mb-3">
                      No past orders yet
                    </h4>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      Your order history will appear here
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order, index) => {
                      console.log('Cart: Mapping order:', order._id, order);
                      return (
                        <OrderItem
                          key={order._id || index}
                          order={order}
                          generatePDF={generatePDF}
                          updateOrder={updateOrder}
                          cancelOrder={cancelOrder}
                        />
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.section>

          {/* Floating action button placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed bottom-8 right-8 z-50"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;