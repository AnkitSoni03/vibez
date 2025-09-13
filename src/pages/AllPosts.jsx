import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import {
  Heart,
  MessageCircle,
  User,
  MoreVertical,
  ArrowLeft,
  Send,
  PlusCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import parse from "html-react-parser";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AISummary from "../components/AISummary";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [expandedContents, setExpandedContents] = useState({});
  const [userLikes, setUserLikes] = useState({});
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("latest");
  const [filterQuery, setFilterQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [fullImageView, setFullImageView] = useState(null);

  const commentInputRefs = useRef({});
  const contentRefs = useRef({});
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const location = useLocation();
  const [highlightedPost, setHighlightedPost] = useState(null);
  const postRefs = useRef({});

  useEffect(() => {
    if (location.state?.scrollToPost && posts.length > 0) {
      const postId = location.state.scrollToPost;
      const postElement = postRefs.current[postId];

      if (postElement) {
        postElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedPost(postId);

        // Automatically expand comments if notification type is comment
        if (location.state.notificationType === "comment") {
          setExpandedPosts((prev) => ({ ...prev, [postId]: true }));
        }

        setTimeout(() => {
          setHighlightedPost(null);
        }, 3000);
      }

      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [posts, location.state]);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, likesData] = await Promise.all([
          appwriteService.getAllPosts("active"),
          fetchAllLikes(),
        ]);

        // Fetch comments for each post
        const postsWithComments = await Promise.all(
          postsData.documents.map(async (post) => {
            const comments = await appwriteService.getComments(post.$id);
            return { ...post, comments: comments.documents };
          })
        );

        setPosts(postsWithComments);
        setUserLikes(likesData);

        // Simulate loading saved posts
        setSavedPosts(postsWithComments.slice(0, 2).map((post) => post.$id));
      } catch (error) {
        toast.error("Failed to load posts");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllLikes = async () => {
      const likes = {};
      const posts = await appwriteService.getAllPosts("active");

      await Promise.all(
        posts.documents.map(async (post) => {
          const likeData = await appwriteService.getLikes(post.$id);
          likes[post.$id] = likeData.documents || [];
        })
      );

      return likes;
    };

    fetchData();
  }, [userData, navigate]);

  useEffect(() => {
    if (!loading && posts.length > 0) {
      const observers = {};

      posts.forEach((post) => {
        const contentElement = contentRefs.current[post.$id];
        if (contentElement) {
          const needsExpansion = contentNeedsExpansion(post.$id);
          setExpandedContents((prev) => ({
            ...prev,
            [post.$id]: prev[post.$id] ?? false,
          }));

          if (!observers[post.$id]) {
            observers[post.$id] = new ResizeObserver(() => {
              const needsExpansionNow = contentNeedsExpansion(post.$id);
              if (needsExpansion !== needsExpansionNow) {
                setExpandedContents((prev) => ({
                  ...prev,
                  [post.$id]: prev[post.$id] ?? false,
                }));
              }
            });
            observers[post.$id].observe(contentElement);
          }
        }
      });

      return () => {
        Object.values(observers).forEach((observer) => observer.disconnect());
      };
    }
  }, [posts, loading]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (fullImageView) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullImageView]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuOpen) setMenuOpen(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  // Close full image view on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && fullImageView) {
        setFullImageView(null);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [fullImageView]);

  const handleLike = async (post) => {
    if (!userData) {
      navigate("/login");
      return;
    }

    try {
      const hasLiked = userLikes[post.$id]?.some(
        (like) => like.userId === userData.$id
      );

      if (hasLiked) {
        await appwriteService.unlikePost(post.$id, userData.$id);
        toast.success("Post unliked");
      } else {
        await appwriteService.likePost(post.$id, userData.$id);
        toast.success("Post liked");

        // Create notification for post owner
        if (post.UserId !== userData.$id) {
          await appwriteService.createNotification({
            userId: post.UserId,
            type: "like",
            message: `${userData.name} liked your post "${post.Title}"`,
            postId: post.$id,
          });
        }
      }

      // Refresh likes data
      const updatedLikes = await appwriteService.getLikes(post.$id);
      setUserLikes((prev) => ({
        ...prev,
        [post.$id]: updatedLikes.documents,
      }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddComment = async (post) => {
    if (!commentTexts[post.$id]?.trim()) return;

    try {
      const comment = await appwriteService.addComment(
        post.$id,
        userData.$id,
        userData.name,
        commentTexts[post.$id]
      );

      // Create notification for post owner
      if (post.UserId !== userData.$id) {
        await appwriteService.createNotification({
          userId: post.UserId,
          type: "comment",
          message: `${userData.name} commented on your post "${post.Title}"`,
          postId: post.$id,
          commentId: comment.$id,
        });
      }

      // Update UI
      const updatedComments = await appwriteService.getComments(post.$id);
      setPosts((prev) =>
        prev.map((p) =>
          p.$id === post.$id ? { ...p, comments: updatedComments.documents } : p
        )
      );
      setCommentTexts((prev) => ({ ...prev, [post.$id]: "" }));
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDelete = async (postId, imageId, e) => {
    e.stopPropagation();
    setMenuOpen(null);

    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await Promise.all([
          appwriteService.deletePost(postId),
          appwriteService.deleteFile(imageId),
        ]);
        setPosts((prev) => prev.filter((post) => post.$id !== postId));
        toast.success("Post deleted");
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  const toggleComments = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // Focus on comment input when opening comments
    setTimeout(() => {
      if (!expandedPosts[postId] && commentInputRefs.current[postId]) {
        commentInputRefs.current[postId].focus();
      }
    }, 100);
  };

  const toggleContentExpansion = (postId) => {
    setExpandedContents((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleMenu = (postId, e) => {
    e.stopPropagation();
    setMenuOpen((prev) => (prev === postId ? null : postId));
  };

  const toggleSavePost = (postId) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );

    toast.success(
      savedPosts.includes(postId)
        ? "Post removed from saved"
        : "Post saved successfully"
    );
  };

  const openFullImage = (post, e) => {
    e.stopPropagation();
    if (post["Unique-image"]) {
      setFullImageView({
        imageId: post["Unique-image"],
        title: post.Title,
      });
    }
  };

  const downloadImage = async (imageId, title) => {
    try {
      const imageUrl = appwriteService.getFilePreview(imageId);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const contentNeedsExpansion = (postId) => {
    const contentElement = contentRefs.current[postId];
    if (!contentElement) return false;

    const lineHeight =
      parseInt(window.getComputedStyle(contentElement).lineHeight) || 24;
    const maxHeight = lineHeight * 6; // 6 lines
    return contentElement.scrollHeight > maxHeight;
  };

  const filteredPosts = posts
    .filter((post) => {
      if (!filterQuery) return true;

      try {
        // Create regex from filter query, case insensitive by default
        const regex = new RegExp(filterQuery, "i");

        return regex.test(post.Title) || regex.test(post.Content);
      } catch (e) {
        // If regex is invalid, fall back to simple string includes
        return (
          post.Title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          post.Content.toLowerCase().includes(filterQuery.toLowerCase())
        );
      }
    })
    .sort((a, b) => {
      if (activeTab === "latest") {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      } else if (activeTab === "popular") {
        return (
          (userLikes[b.$id]?.length || 0) - (userLikes[a.$id]?.length || 0)
        );
      } else if (activeTab === "saved") {
        return savedPosts.includes(b.$id) ? -1 : 1;
      }
      return 0;
    })
    .filter((post) => activeTab !== "saved" || savedPosts.includes(post.$id));

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      {/* Main Content Container */}
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:w-72 xl:w-80 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-4">
          <LeftSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/90 border-b border-gray-800 shadow-md">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <h1 className="text-xl font-bold text-gray-300">
                  Community Feed
                </h1>

                {userData && (
                  <Link
                    to="/add-post"
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                  >
                    <PlusCircle size={16} />
                    <span className="hidden sm:inline">Create Post</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar and Main Content */}
          <div className="w-full max-w-2xl mx-auto sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {filterQuery && (
                    <button
                      onClick={() => setFilterQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex justify-between mt-4 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab("latest")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "latest"
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setActiveTab("popular")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "popular"
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-4 py-2 font-medium ${
                    activeTab === "saved"
                      ? "text-indigo-400 border-b-2 border-indigo-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Saved
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="py-4 space-y-6">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
                  {activeTab === "saved" ? (
                    <>
                      <Bookmark
                        size={48}
                        className="mx-auto mb-4 text-gray-500"
                      />
                      <p className="text-gray-400 text-lg">
                        No saved posts yet.
                      </p>
                      <button
                        onClick={() => setActiveTab("latest")}
                        className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Browse posts
                      </button>
                    </>
                  ) : filterQuery ? (
                    <>
                      <p className="text-gray-400 text-lg">
                        No posts match your search.
                      </p>
                      <button
                        onClick={() => setFilterQuery("")}
                        className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Clear search
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-400 text-lg">
                        No posts yet. Be the first to create one!
                      </p>
                      {userData && (
                        <Link
                          to="/add-post"
                          className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
                        >
                          Create Your First Post
                        </Link>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.$id}
                      ref={(el) => (postRefs.current[post.$id] = el)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-gray-800/70 overflow-hidden shadow-lg hover:shadow-indigo-900/20 transition-all border border-gray-700/50 sm:rounded-xl ${
                        highlightedPost === post.$id
                          ? "ring-2 ring-indigo-500 animate-pulse-fast"
                          : ""
                      }`}
                    >
                      {/* Post Header */}
                      <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                        <Link
                          to={`#`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white overflow-hidden shadow-md">
                            {post.UserAvatar ? (
                              <img
                                src={post.UserAvatar}
                                alt={post.UserName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              post.UserName?.charAt(0) || <User size={18} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                              {post.UserName || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(post.$createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </Link>

                        {/* Options Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => toggleMenu(post.$id, e)}
                            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50"
                          >
                            <MoreVertical size={20} />
                          </button>

                          {menuOpen === post.$id && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20 border border-gray-700">
                              <button
                                onClick={() => toggleSavePost(post.$id)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700"
                              >
                                {savedPosts.includes(post.$id) ? (
                                  <>
                                    <BookmarkCheck size={16} />
                                    <span>Unsave Post</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark size={16} />
                                    <span>Save Post</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpen(null);
                                  navigator.clipboard.writeText(
                                    window.location.origin + `/post/${post.$id}`
                                  );
                                  toast.success("Link copied to clipboard");
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700"
                              >
                                <Share2 size={16} />
                                <span>Share Post</span>
                              </button>

                              {userData?.$id === post.UserId && (
                                <>
                                  <div className="border-t border-gray-700 my-1"></div>
                                  <Link
                                    to={`/edit-post/${post.$id}`}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span>Edit Post</span>
                                  </Link>
                                  <button
                                    onClick={(e) =>
                                      handleDelete(
                                        post.$id,
                                        post["Unique-image"],
                                        e
                                      )
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700"
                                  >
                                    <span>Delete Post</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-4">
                        <h2 className="text-xl font-bold text-white mb-3">
                          {post.Title}
                        </h2>
                        <div className="relative">
                          <div
                            ref={(el) => (contentRefs.current[post.$id] = el)}
                            className={`prose prose-invert max-w-none text-gray-300 transition-all duration-300 overflow-hidden ${
                              expandedContents[post.$id] ? "" : "max-h-20"
                            }`}
                          >
                            {parse(post.Content || "")}
                          </div>

                          {contentNeedsExpansion(post.$id) && (
                            <button
                              onClick={() => toggleContentExpansion(post.$id)}
                              className="mt-1 flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                            >
                              {expandedContents[post.$id] ? (
                                <>
                                  See less <ChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  Read more <ChevronDown size={16} />
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* AI Summary */}
                        <div className="mt-4">
                          <AISummary
                            content={post.Content}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                          >
                            <span className="flex items-center">
                              <Sparkles size={18} className="mr-2" />
                              Get AI Summary
                            </span>
                          </AISummary>
                        </div>

                        {post["Unique-image"] && (
                          <div className="mt-4 rounded-lg overflow-hidden cursor-pointer relative group">
                            <img
                              src={appwriteService.getFilePreview(
                                post["Unique-image"]
                              )}
                              alt={post.Title}
                              className="w-full h-auto max-h-96 object-cover hover:scale-[1.01] transition-transform"
                              loading="lazy"
                              onClick={(e) => openFullImage(post, e)}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={(e) => openFullImage(post, e)}
                                className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                              >
                                <Maximize size={20} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="px-4 py-3 border-t border-gray-700/50 flex justify-between">
                        <div className="flex gap-6">
                          <button
                            onClick={() => handleLike(post)}
                            className={`flex items-center gap-1.5 ${
                              userLikes[post.$id]?.some(
                                (like) => like.userId === userData?.$id
                              )
                                ? "text-pink-500"
                                : "text-gray-400 hover:text-pink-500"
                            } transition-colors`}
                          >
                            <Heart
                              size={18}
                              className={`${
                                userLikes[post.$id]?.some(
                                  (like) => like.userId === userData?.$id
                                )
                                  ? "animate-heartbeat"
                                  : ""
                              }`}
                              fill={
                                userLikes[post.$id]?.some(
                                  (like) => like.userId === userData?.$id
                                )
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                            <span className="text-sm font-medium">
                              {userLikes[post.$id]?.length || 0}
                            </span>
                          </button>

                          <button
                            onClick={() => toggleComments(post.$id)}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <MessageCircle size={18} />
                            <span className="text-sm font-medium">
                              {post.comments?.length || 0}
                            </span>
                          </button>
                        </div>

                        <button
                          onClick={() => toggleSavePost(post.$id)}
                          className={`${
                            savedPosts.includes(post.$id)
                              ? "text-indigo-400"
                              : "text-gray-400 hover:text-indigo-400"
                          } transition-colors`}
                        >
                          {savedPosts.includes(post.$id) ? (
                            <BookmarkCheck size={18} fill="currentColor" />
                          ) : (
                            <Bookmark size={18} />
                          )}
                        </button>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedPosts[post.$id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-gray-850 border-t border-gray-700/50"
                          >
                            <div className="p-4">
                              <h3 className="text-gray-300 font-medium mb-3">
                                Comments
                              </h3>

                              {userData && (
                                <div className="flex gap-2 mb-4">
                                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                    {userData.name?.charAt(0) || (
                                      <User size={14} />
                                    )}
                                  </div>
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      ref={(ref) =>
                                        (commentInputRefs.current[post.$id] =
                                          ref)
                                      }
                                      value={commentTexts[post.$id] || ""}
                                      onChange={(e) =>
                                        setCommentTexts((prev) => ({
                                          ...prev,
                                          [post.$id]: e.target.value,
                                        }))
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleAddComment(post);
                                        }
                                      }}
                                      placeholder="Write a comment..."
                                      className="w-full bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700"
                                    />
                                    <button
                                      onClick={() => handleAddComment(post)}
                                      disabled={!commentTexts[post.$id]?.trim()}
                                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-sm p-1 rounded-full ${
                                        commentTexts[post.$id]?.trim()
                                          ? "text-indigo-400 hover:text-indigo-300 hover:bg-gray-700/50"
                                          : "text-gray-600 cursor-not-allowed"
                                      }`}
                                    >
                                      <Send size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Comments List */}
                              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {post.comments?.length > 0 ? (
                                  post.comments.map((comment) => (
                                    <div
                                      key={comment.$id}
                                      className="flex gap-2 pb-3 border-b border-gray-700/30"
                                    >
                                      {/* Avatar */}
                                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white">
                                        {comment.username
                                          ?.charAt(0)
                                          .toUpperCase() || <User size={14} />}
                                      </div>

                                      {/* Comment Content */}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <Link
                                            to={`/profile/${comment.userId}`}
                                            className="font-medium text-gray-300 hover:text-indigo-400 transition-colors"
                                          >
                                            {comment.username || "Anonymous"}
                                          </Link>
                                          <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(
                                              new Date(
                                                comment.timestamp ||
                                                  comment.$createdAt
                                              ),
                                              {
                                                addSuffix: true,
                                              }
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">
                                          {comment.content ||
                                            comment.text ||
                                            ""}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>
                                      No comments yet. Be the first to comment!
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:w-80 xl:w-96 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <RightSidebar />
        </div>
      </div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {fullImageView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setFullImageView(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-gray-900/80 backdrop-blur-sm">
                <h3 className="text-white font-medium truncate">
                  {fullImageView.title}
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      downloadImage(fullImageView.imageId, fullImageView.title)
                    }
                    className="text-gray-300 hover:text-white p-1"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => setFullImageView(null)}
                    className="text-gray-300 hover:text-white p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-10 relative">
                <img
                  src={appwriteService.getFilePreview(fullImageView.imageId)}
                  alt={fullImageView.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AllPosts;
