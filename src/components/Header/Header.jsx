import React, { useState, useEffect } from "react";
import { Container, Logo, LogoutBtn } from "../index";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Bell, Menu, X } from "lucide-react";
import appwriteService from "../../appwrite/config";
import { formatDistanceToNow } from "date-fns";
import conf from "../../conf/conf";
import { toast } from "react-hot-toast";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const navigate = useNavigate();

  // Real-time notifications setup
  useEffect(() => {
    let unsubscribe;

    const fetchAndSubscribe = async () => {
      if (!authStatus || !userData?.$id) return;

      try {
        setNotificationsLoading(true);

        // Initial fetch
        const response = await appwriteService.getUserNotifications(
          userData.$id
        );
        setNotifications(response.documents || []);

        // Real-time subscription
        const channel = `collections.${conf.appwriteNotificationsCollectionId}.documents`;
        unsubscribe = appwriteService.client.subscribe(channel, (response) => {
          // Handle new notifications
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            const newNotif = response.payload;
            if (newNotif.userId === userData.$id) {
              setNotifications((prev) => [newNotif, ...prev]);
            }
          }

          // Handle read status updates
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            const updatedNotif = response.payload;
            setNotifications((prev) =>
              prev.map((n) => (n.$id === updatedNotif.$id ? updatedNotif : n))
            );
          }
        });
      } catch (error) {
        console.error("Notification error:", error);
        toast.error("Failed to load notifications");
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchAndSubscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authStatus, userData]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await appwriteService.markNotificationAsRead(notification.$id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.$id === notification.$id ? { ...n, read: true } : n
          )
        );
      }
      navigate(`/post/${notification.postId}`);
    } catch (error) {
      console.error("Notification click error:", error);
      toast.error("Failed to update notification");
    } finally {
      setShowNotifications(false);
    }
  };

  const navigateAndCloseMenu = (slug) => {
    navigate(slug);
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
    },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg"
    >
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="./vibez-logo.png"
              alt="logo"
              className="w-10 h-10 object-contain rounded-md shadow-md"
            />
            <Logo width="40px" darkMode />
            <span className="text-xl font-bold text-white hidden sm:inline">
              VIBEZ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Buttons */}
            {navItems.map((item) =>
              item.active ? (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.slug)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    window.location.pathname === item.slug
                      ? "bg-indigo-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </motion.button>
              ) : null
            )}

            {/* Notification Icon with dropdown */}
            {authStatus && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-300 hover:text-white p-1"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-400">• Live</span>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {notificationsLoading ? (
                      <div className="p-4 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="p-4 text-gray-400 text-center">
                        No notifications yet
                      </p>
                    ) : (
                      notifications
                        .sort(
                          (a, b) =>
                            new Date(b.$createdAt) - new Date(a.$createdAt)
                        )
                        .map((notification) => (
                          <div
                            key={notification.$id}
                            className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                              !notification.read ? "bg-gray-700" : ""
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <p className="text-sm text-white">
                              {notification.message}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-400">
                                {formatDistanceToNow(
                                  new Date(notification.$createdAt),
                                  { addSuffix: true }
                                )}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Info */}
            {authStatus && (
              <div className="text-xs text-gray-400 text-left">
                <p className="font-semibold">{userData?.name || "No Name"}</p>
                <p>{userData?.email}</p>
              </div>
            )}

            {/* Logout */}
            {authStatus && <LogoutBtn />}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {authStatus && (
              <div className="relative mr-2">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-300 hover:text-white p-1"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    {notificationsLoading ? (
                      <div className="p-4 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="p-4 text-gray-400 text-center">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.$id}
                          className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                            !notification.read ? "bg-gray-700" : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <p className="text-sm text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(
                              new Date(notification.$createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-md"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gray-800 border-t border-gray-700"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) =>
              item.active ? (
                <button
                  key={item.name}
                  onClick={() => navigateAndCloseMenu(item.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    window.location.pathname === item.slug
                      ? "bg-indigo-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              ) : null
            )}

            {/* Mobile User Info */}
            {authStatus && (
              <div className="px-3 py-2 border-t border-gray-700 mt-2">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {userData?.name ? userData.name[0].toUpperCase() : "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {userData?.name || "No Name"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {userData?.email}
                    </p>
                  </div>
                  <div className="inline-flex">
                    <LogoutBtn />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

export default Header;
