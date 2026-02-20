import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { auth } from '../firebaseConfig.js';
import { User, List, AlertTriangle, Trash2, Check, X, Utensils, Loader2 } from 'lucide-react';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
});

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        console.log('fetchAllOrders: No Firebase user. Redirecting to login.');
        toast.error('Please log in to view orders.');
        navigate('/login');
        setIsLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        console.log('fetchAllOrders: idToken:', idToken.slice(0, 10) + '...');

        console.log('fetchAllOrders: Sending GET /api/orders/all');
        const response = await api.get('/api/orders/all', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        console.log('fetchAllOrders: Response:', response.data);

        if (response.data.success && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
          console.log('fetchAllOrders: Set orders:', response.data.orders);
          if (response.data.orders.length === 0) {
            toast.info('No orders found.');
          }
        } else {
          console.warn('fetchAllOrders: Invalid response format:', response.data);
          toast.error('Failed to load orders: Invalid response.');
        }
      } catch (error) {
        console.error('fetchAllOrders: Error:', error.response?.data || error.message);
        let errorMessage = error.response?.data?.message || 'Failed to fetch orders.';
        if (error.response?.status === 403) {
          errorMessage = 'Admin access required.';
          navigate('/login');
        } else if (error.response?.status === 401) {
          errorMessage = 'Unauthorized: Please log in again.';
          navigate('/login');
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleCancelOrder = async (orderId) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await api.delete(`/api/orders/${orderId}/cancel`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.data.success) {
        setOrders(orders.map((order) =>
          order._id === orderId ? { ...order, status: 'Cancelled' } : order
        ));
        toast.success('Order cancelled successfully.');
      }
    } catch (error) {
      console.error('cancelOrder: Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order.';
      toast.error(errorMessage);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await api.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (response.data.success) {
        setOrders(orders.filter((order) => order._id !== orderId));
        toast.success('Order deleted successfully.');
      }
    } catch (error) {
      console.error('deleteOrder: Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to delete order.';
      toast.error(errorMessage);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await api.put(
        `/api/orders/${orderId}`,
        { status: 'Delivered' },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      if (response.data.success) {
        setOrders(orders.map((order) =>
          order._id === orderId ? { ...order, status: 'Delivered' } : order
        ));
        toast.success('Order accepted and marked as delivered.');
      }
    } catch (error) {
      console.error('acceptOrder: Error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.errors?.map((e) => e.msg).join(', ') ||
        error.response?.data?.message ||
        'Failed to accept order.';
      toast.error(errorMessage);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    })
  };

  const buttonHover = {
    scale: 1.03,
    transition: { duration: 0.2 }
  };

  const buttonTap = {
    scale: 0.98,
    transition: { duration: 0.1 }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ rotate: 0, scale: 0.8 }}
          animate={{ 
            rotate: 360, 
            scale: 1,
            transition: { 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            } 
          }}
          className="h-16 w-16"
        >
          <Loader2 className="w-full h-full text-blue-500" />
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              transition: { duration: 0.6 }
            }}
          >
            <AlertTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={buttonHover}
            whileTap={buttonTap}
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-xl hover:bg-blue-700 transition-all font-medium"
          >
            Go to Login
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col"
    >
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans flex-1">
        <div className="max-w-7xl mx-auto">
          <motion.section 
            className="mb-8 text-center"
            variants={itemVariants}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                Admin Dashboard
              </span>
            </h1>
            <p className="text-lg text-gray-600 mt-4">Manage all guest orders efficiently</p>
          </motion.section>

          <motion.section
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="flex items-center justify-between mb-6"
              variants={itemVariants}
            >
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <List className="mr-3 text-blue-500" size={24} />
                All Orders
              </h2>
              <span className="text-sm font-medium text-gray-500 bg-blue-100/50 px-3 py-1 rounded-full">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </motion.div>

            <AnimatePresence>
              {orders.length === 0 ? (
                <motion.div
                  className="text-center py-12"
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      delay: 0.3,
                      duration: 0.6,
                      ease: [0.6, -0.05, 0.01, 0.99]
                    }
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      transition: { 
                        repeat: Infinity, 
                        duration: 3,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <Utensils className="mx-auto text-5xl text-blue-300 mb-4" />
                  </motion.div>
                  <h4 className="text-xl font-medium text-gray-700 mb-3">No orders yet</h4>
                  <p className="text-gray-500 max-w-xs mx-auto">Guest orders will appear here</p>
                </motion.div>
              ) : (
                <motion.div 
                  className="overflow-x-auto max-h-[60vh] overflow-y-auto"
                  variants={containerVariants}
                >
                  <table className="min-w-full bg-white rounded-xl">
                    <thead className="sticky top-0 bg-blue-50/70 backdrop-blur-sm z-10">
                      <motion.tr 
                        className="text-left text-sm font-semibold text-gray-900"
                        variants={itemVariants}
                      >
                        <th className="py-4 px-6 border-b border-blue-100">Order ID</th>
                        <th className="py-4 px-6 border-b border-blue-100">Guest</th>
                        <th className="py-4 px-6 border-b border-blue-100">Items</th>
                        <th className="py-4 px-6 border-b border-blue-100">Total (LKR)</th>
                        <th className="py-4 px-6 border-b border-blue-100">Delivery Time</th>
                        <th className="py-4 px-6 border-b border-blue-100">Status</th>
                        <th className="py-4 px-6 border-b border-blue-100">Ordered On</th>
                        <th className="py-4 px-6 border-b border-blue-100">Actions</th>
                      </motion.tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {orders.map((order, index) => (
                          <motion.tr
                            key={order._id}
                            className="text-sm text-gray-700 hover:bg-blue-50/30 transition-colors duration-200"
                            variants={tableRowVariants}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -30 }}
                            layout
                          >
                            <td className="py-4 px-6 border-b border-blue-100">
                              #{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100">
                              <div className="flex items-center">
                                <User className="mr-2 text-blue-500" size={16} />
                                <div>
                                  <p className="font-medium">
                                    {order.userId
                                      ? `${order.userId.fname || ''} ${order.userId.lname || ''}`.trim() || 'Unknown Guest'
                                      : 'Unknown Guest'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {order.userId && order.userId.email ? order.userId.email : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100">
                              <ul className="list-disc list-inside space-y-1">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item, idx) => (
                                    <li key={`${order._id}-${item.id || idx}-${idx}`}>
                                      {item.name || 'Unknown Item'} (x{item.quantity || 1}) - LKR {(item.price && item.quantity ? (item.price * item.quantity).toFixed(0) : '0')}
                                    </li>
                                  ))
                                ) : (
                                  <li>No items</li>
                                )}
                              </ul>
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100 font-medium">
                              LKR {order.totalPrice ? order.totalPrice.toFixed(0) : '0'}
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100">
                              {order.deliveryTime || 'N/A'}
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100">
                              <motion.span
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  order.status === 'Delivered'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {order.status || 'Unknown'}
                              </motion.span>
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-4 px-6 border-b border-blue-100">
                              <div className="flex space-x-3">
                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                  <>
                                    <motion.button
                                      whileHover={buttonHover}
                                      whileTap={buttonTap}
                                      onClick={() => handleAcceptOrder(order._id)}
                                      className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-all"
                                      title="Accept and mark order as delivered"
                                      disabled={!order._id}
                                    >
                                      <Check className="mr-1.5" size={14} />
                                      Accept
                                    </motion.button>
                                    <motion.button
                                      whileHover={buttonHover}
                                      whileTap={buttonTap}
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-all"
                                      title="Cancel order"
                                      disabled={!order._id}
                                    >
                                      <X className="mr-1.5" size={14} />
                                      Cancel
                                    </motion.button>
                                  </>
                                )}
                                <motion.button
                                  whileHover={buttonHover}
                                  whileTap={buttonTap}
                                  onClick={() => handleDeleteOrder(order._id)}
                                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all"
                                  title="Delete order permanently"
                                  disabled={!order._id}
                                >
                                  <Trash2 className="mr-1.5" size={14} />
                                  Delete
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrders;