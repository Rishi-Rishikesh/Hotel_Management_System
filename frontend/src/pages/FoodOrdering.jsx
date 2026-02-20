import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { FaSearch, FaShoppingCart, FaUtensils, FaMinus, FaPlus, FaStar, FaFireAlt, FaLeaf, FaIceCream, FaRegHeart, FaHeart, FaArrowRight, FaRedo } from 'react-icons/fa';
import { GiMeal, GiForkKnifeSpoon } from 'react-icons/gi';

// Updated placeholder images for Sri Lankan foods
const placeholderImages = {
  riceCurry: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  kottu: 'https://images.unsplash.com/photo-1622033375730-9775a7b475f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  hoppers: 'https://images.unsplash.com/photo-1601050690597-df056928231e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  dhal: 'https://images.unsplash.com/photo-1613995366165-1d5d57981486?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  polSambol: 'https://images.unsplash.com/photo-1627308594193-1b1d7a7e0f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  stringHoppers: 'https://images.unsplash.com/photo-1627308594120-5e6932e0e8c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  milkTea: 'https://images.unsplash.com/photo-1562565652-9d8a9b3e7179?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  gingerTea: 'https://images.unsplash.com/photo-1604430482768-27126a439e73?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  teaPlan: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
  idly:  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',

};

const FoodOrdering = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(['user']);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.95]);
  const userData = cookies.user || JSON.parse(localStorage.getItem('user'));

  const initialMenuItems = [
    {
      id: 1,
      name: 'Rice and Curry',
      price: 400, // ~$1.33 USD, realistic for a veggie plate
      description: 'Steamed rice with a choice of chicken, fish, or vegetable curries, served with pol sambol',
      image: placeholderImages.riceCurry,
      mealType: 'Lunch',
      category: 'Curry',
      rating: 4.8,
      calories: 600,
      popular: true,
    },
    {
      id: 2,
      name: 'Kottu Roti',
      price: 350, // ~$1.17 USD
      description: 'Chopped godamba roti stir-fried with vegetables, egg, and optional chicken',
      image: placeholderImages.kottu,
      mealType: 'Dinner',
      category: 'Street Food',
      rating: 4.7,
      calories: 500,
      popular: true,
    },
    {
      id: 3,
      name: 'Egg Hoppers',
      price: 150, // ~$0.50 USD per hopper
      description: 'Crispy rice flour pancakes with a fried egg, served with lunu miris',
      image: placeholderImages.hoppers,
      mealType: 'Breakfast',
      category: 'Main',
      rating: 4.5,
      calories: 200,
      popular: true,
    },
    {
      id: 4,
      name: 'Dhal Curry',
      price: 100, // ~$0.33 USD
      description: 'Creamy red lentil curry with coconut milk and spices, perfect with rice or roti',
      image: placeholderImages.dhal,
      mealType: 'Lunch',
      category: 'Curry',
      rating: 4.3,
      calories: 250,
      popular: false,
    },
    {
      id: 5,
      name: 'Pol Sambol',
      price: 80, // ~$0.27 USD
      description: 'Spicy coconut relish with chili, onion, and lime, a must-have side',
      image: placeholderImages.polSambol,
      mealType: 'All',
      category: 'Side',
      rating: 4.2,
      calories: 100,
      popular: false,
    },
    {
      id: 6,
      name: 'String Hoppers',
      price: 200, // ~$0.67 USD for a portion
      description: 'Steamed rice noodle nests served with coconut milk curry and sambol',
      image: placeholderImages.stringHoppers,
      mealType: 'Breakfast',
      category: 'Main',
      rating: 4.4,
      calories: 300,
      popular: false,
    },
    {
      id: 7,
      name: 'Ceylon Milk Tea',
      price: 120, // ~$0.40 USD
      description: 'Rich and creamy tea brewed with premium Ceylon leaves',
      image: placeholderImages.milkTea,
      mealType: 'All',
      category: 'Tea',
      rating: 4.6,
      calories: 150,
      popular: true,
    },
    {
      id: 8,
      name: 'Ginger Tea',
      price: 100, // ~$0.33 USD
      description: 'Warming Ceylon tea infused with fresh ginger',
      image: placeholderImages.gingerTea,
      mealType: 'All',
      category: 'Tea',
      rating: 4.3,
      calories: 50,
      popular: false,
    },
    {
      id: 9,
      name: 'Tea Plan',
      price: 500, // ~$1.67 USD for a curated set
      description: 'A selection of Ceylon teas with biscuits and coconut sweets',
      image: placeholderImages.teaPlan,
      mealType: 'All',
      category: 'Tea',
      rating: 4.9,
      calories: 400,
      popular: true,
    },
     {
      id: 10,
      name: 'Idly',
      price: 200, // ~$0.67 USD for a portion
      description: 'Idly wiith coconut chutney and sambar, a popular dinner dish',
      image: placeholderImages.stringHoppers,
      mealType: 'Breakfast',
      category: 'Main',
      rating: 4.4,
      calories: 300,
      popular: false,
    }
  ];

  const featuredItems = initialMenuItems.filter((item) => item.popular).slice(0, 3);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = cookies.user || JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          toast.error('Please log in to order food.');
          navigate('/login');
          return;
        }
        setUser(userData);
        setQuantities(
          initialMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
        );
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('An error occurred. Please log in again.');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [cookies.user, navigate]);

  const toggleFavorite = (itemId) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
    toast.info(
      favorites.includes(itemId)
        ? 'Removed from favorites'
        : 'Added to favorites'
    );
  };

  const filteredMenuItems = initialMenuItems.filter((item) => {
    const mealTypeMatch =
      selectedMealType === 'All' ||
      (selectedMealType === 'Favorites' && favorites.includes(item.id)) ||
      item.mealType === selectedMealType ||
      (selectedMealType === 'All' && item.mealType === 'All');
    const categoryMatch =
      selectedCategory === 'All' || item.category === selectedCategory;
    const searchMatch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return mealTypeMatch && categoryMatch && searchMatch;
  });

  const updateMenuQuantity = (itemId, delta) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, prev[itemId] + delta);
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const addToCart = (item, quantity = quantities[item.id]) => {
    if (quantity === 0) {
      toast.error('Please select a quantity.');
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity }];
    });

    setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
    toast.success(`${quantity} ${item.name} added to cart!`);
  };

  const quickAddToCart = (item) => {
    addToCart(item, 1);
  };

  const handleProceedToCart = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    navigate('/cart', { state: { cart } });
  };

  const resetFilters = () => {
    setSelectedMealType('All');
    setSelectedCategory('All');
    setSearchQuery('');
    toast.info('Filters reset');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 border-4 border-t-orange-600 border-gray-300 rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              rotate: Math.random() * 360,
              opacity: 0,
            }}
            animate={{
              y: [0, Math.random() * 120 - 60],
              x: [0, Math.random() * 120 - 60],
              rotate: [0, Math.random() * 360],
              opacity: [0, 0.1, 0],
              transition: {
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              },
            }}
            className="absolute text-orange-200"
            style={{
              fontSize: `${Math.random() * 28 + 14}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 4 === 0 ? <FaUtensils /> : i % 4 === 1 ? <GiMeal /> : i % 4 === 2 ? <GiForkKnifeSpoon /> : <FaStar />}
          </motion.div>
        ))}
      </div>

      <motion.div
        style={{ opacity: headerOpacity }}
        className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 font-sans relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Welcome Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="mb-16"
          >
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 blur-sm"
              ></motion.div>
              <div className="relative z-10 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl font-extrabold text-white mb-4"
                >
                  Welcome to Your Culinary Journey,
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="block text-5xl md:text-6xl bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mt-2"
                  >
                    {user.fname}!
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg text-white/80 mb-6 max-w-2xl mx-auto"
                >
                  Savor authentic Sri Lankan flavors with our traditional dishes and teas!
                </motion.p>
                <motion.div
                  className="flex justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold flex items-center shadow-md hover:bg-gray-100"
                  >
                    Explore Menu <FaArrowRight className="ml-2" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProceedToCart}
                    className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold flex items-center shadow-md hover:bg-gray-100"
                  >
                    View Cart <FaShoppingCart className="ml-2" />
                  </motion.button>
                </motion.div>
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <img
                    src={featuredItems[0].image}
                    alt="Featured Dish"
                    className="w-64 h-40 object-cover rounded-2xl shadow-lg mx-auto"
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* Search Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <div className="relative max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
              >
                <FaSearch className="text-gray-500" />
              </motion.div>
              <motion.input
                type="text"
                placeholder="Search dishes, teas, or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-lg text-gray-700 placeholder-gray-500 transition-all duration-300"
                whileFocus={{
                  boxShadow: '0 0 0 3px rgba(249, 115, 22, 0.3)',
                  borderColor: 'rgba(249, 115, 22, 0.5)',
                }}
              />
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 bg-white/95 rounded-xl shadow-lg mt-2 p-4 z-20"
                >
                  {filteredMenuItems.slice(0, 3).map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-3 p-2 hover:bg-orange-50 rounded-lg cursor-pointer"
                      onClick={() => setSearchQuery(item.name)}
                      whileHover={{ x: 5 }}
                    >
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-gray-700">{item.name}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Sticky Filter Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-10 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-orange-100"
          >
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center">
                    <GiMeal className="mr-2 text-orange-500" />
                    Meal Type
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Favorites', 'Breakfast', 'Lunch', 'Dinner'].map((type) => (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedMealType(type)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center ${
                          selectedMealType === type
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {type === 'Breakfast' && <FaLeaf className="mr-2 text-orange-400" />}
                        {type === 'Lunch' && <FaUtensils className="mr-2 text-amber-400" />}
                        {type === 'Dinner' && <FaFireAlt className="mr-2 text-orange-500" />}
                        {type === 'Favorites' && <FaHeart className="mr-2 text-red-500" />}
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center">
                    <GiForkKnifeSpoon className="mr-2 text-orange-500" />
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Main', 'Curry', 'Street Food', 'Side', 'Tea'].map((category) => (
                      <motion.button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full flex items-center font-medium"
              >
                <FaRedo className="mr-2" />
                Reset Filters
              </motion.button>
            </div>
          </motion.section>

          {/* Menu Section */}
          <motion.section
            id="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-16"
          >
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-inner border border-orange-100"
            >
              <div className="flex items-center">
                <FaUtensils className="text-2xl text-orange-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedMealType === 'All' ? 'Our Full Menu' : selectedMealType === 'Favorites' ? 'Your Favorites' : `${selectedMealType} Menu`}
                </h3>
              </div>
              <span className="text-sm font-medium text-gray-500 bg-orange-100/50 px-3 py-1 rounded-full">
                {filteredMenuItems.length} {filteredMenuItems.length === 1 ? 'item' : 'items'}
              </span>
            </motion.div>

            <AnimatePresence>
              {filteredMenuItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-inner border border-orange-100"
                >
                  <div className="max-w-md mx-auto">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        transition: { duration: 2, repeat: Infinity },
                      }}
                    >
                      <FaIceCream className="mx-auto text-5xl text-orange-300 mb-4" />
                    </motion.div>
                    <h4 className="text-xl font-medium text-gray-700 mb-3">No items found</h4>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      Try adjusting your filters or search for something different
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 50, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.05,
                        type: 'spring',
                        stiffness: 100,
                      }}
                      exit={{ opacity: 0, y: 30 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-orange-100 relative group"
                      whileHover={{ y: -8 }}
                    >
                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-md backdrop-blur-sm"
                      >
                        {favorites.includes(item.id) ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-red-500"
                          >
                            <FaHeart />
                          </motion.div>
                        ) : (
                          <FaRegHeart className="text-gray-400 group-hover:text-red-400 transition-colors" />
                        )}
                      </motion.button>

                      {/* Popular Badge */}
                      {item.popular && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center z-10 shadow-md"
                        >
                          <FaStar className="mr-1" />
                          Popular
                        </motion.div>
                      )}

                      {/* Food Image */}
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <motion.div
                          whileHover={{ opacity: 1 }}
                          initial={{ opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4"
                        >
                          <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-full">
                            {item.calories} kcal
                          </span>
                        </motion.div>
                      </div>

                      {/* Food Details */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                          <p className="text-lg font-bold text-orange-600">LKR {item.price.toFixed(0)}</p>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                        <div className="flex items-center mb-5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < Math.floor(item.rating) ? 'fill-current' : 'fill-current opacity-30'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">({item.rating})</span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-inner">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateMenuQuantity(item.id, -1)}
                              className="bg-gray-100 text-gray-700 p-2 rounded-l-full hover:bg-gray-200 transition-colors"
                              disabled={quantities[item.id] === 0}
                            >
                              <FaMinus className="text-xs" />
                            </motion.button>
                            <span className="px-3 text-sm font-medium text-gray-900 min-w-[20px] text-center">
                              {quantities[item.id]}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateMenuQuantity(item.id, 1)}
                              className="bg-gray-100 text-gray-700 p-2 rounded-r-full hover:bg-gray-200 transition-colors"
                            >
                              <FaPlus className="text-xs" />
                            </motion.button>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{
                                scale: 1.05,
                                boxShadow: '0 5px 15px rgba(249, 115, 22, 0.3)',
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => quickAddToCart(item)}
                              className="px-3 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300 flex items-center"
                            >
                              Quick Add
                            </motion.button>
                            <motion.button
                              whileHover={{
                                scale: 1.05,
                                boxShadow: '0 5px 15px rgba(249, 115, 22, 0.3)',
                              }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => addToCart(item)}
                              disabled={quantities[item.id] === 0}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
                                quantities[item.id] === 0
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg'
                              }`}
                            >
                              <FaShoppingCart className="mr-2" />
                              Add
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Floating Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
              whileTap={{ scale: 0.9 }}
              onClick={handleProceedToCart}
              className="p-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-xl flex items-center justify-center relative"
            >
              <FaShoppingCart className="text-xl" />
              {cart.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md"
                >
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FoodOrdering;