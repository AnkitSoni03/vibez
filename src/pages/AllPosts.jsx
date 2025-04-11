import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Camera,
  Share2,
  Bookmark,
  BookmarkCheck,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import Loader from "../components/Loader";
import parse from "html-react-parser";
import { motion, AnimatePresence } from "framer-motion";

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

  const commentInputRefs = useRef({});
  const contentRefs = useRef({});
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

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

  // Check for content height after posts are loaded
  useEffect(() => {
    const checkContentHeight = () => {
      posts.forEach((post) => {
        const contentElement = contentRefs.current[post.$id];
        if (contentElement) {
          const lineHeight = parseInt(
            getComputedStyle(contentElement).lineHeight
          );
          const height = contentElement.clientHeight;
          const lines = Math.round(height / lineHeight);

          // If content has more than 2 lines and isn't already expanded
          if (lines > 2 && !expandedContents[post.$id]) {
            contentElement.classList.add("line-clamp-2");
          }
        }
      });
    };

    if (!loading && posts.length > 0) {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(checkContentHeight, 100);
    }
  }, [posts, loading, expandedContents]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuOpen) setMenuOpen(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

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

  const filteredPosts = posts
    .filter(
      (post) =>
        post.Title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        post.Content.toLowerCase().includes(filterQuery.toLowerCase())
    )
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

  // Function to check if content needs "Read more" button
  const contentNeedsExpansion = (postId) => {
    const contentElement = contentRefs.current[postId];
    if (!contentElement) return false;

    const lineHeight =
      parseInt(getComputedStyle(contentElement).lineHeight) || 24;
    const height = contentElement.scrollHeight;
    const lines = Math.round(height / lineHeight);

    return lines > 2;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/90 border-b border-gray-800 shadow-md">
        <div className="w-full max-w-[45rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-400 hover:text-white"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <h1 className="text-xl font-bold text-white">Community Feed</h1>

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

      {/* Search Bar */}
      <div className="w-full max-w-[45rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-4 pb-2">
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
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[45rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
              {activeTab === "saved" ? (
                <>
                  <Bookmark size={48} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 text-lg">No saved posts yet.</p>
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/70 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-900/20 transition-all border border-gray-700/50"
                >
                  {/* Post Header */}
                  <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                    <Link
                      to={`/profile/${post.UserId}`}
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

                    {/* Content with Read More functionality */}
                    <div className="relative">
                      <div
                        ref={(el) => (contentRefs.current[post.$id] = el)}
                        className={`prose prose-invert max-w-none text-gray-300 transition-all duration-300 overflow-hidden ${
                          expandedContents[post.$id] ? "" : "line-clamp-2"
                        }`}
                      >
                        {parse(post.Content || "")}
                      </div>

                      {/* Read More / See Less Button */}
                      {contentRefs.current[post.$id] &&
                        contentRefs.current[post.$id].scrollHeight >
                          parseInt(
                            getComputedStyle(contentRefs.current[post.$id])
                              .lineHeight
                          ) *
                            2 && (
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

                    {post["Unique-image"] && (
                      <div className="mt-4 rounded-lg overflow-hidden">
                        <img
                          src={appwriteService.getFilePreview(
                            post["Unique-image"]
                          )}
                          alt={post.Title}
                          className="w-full h-auto max-h-96 object-cover hover:scale-[1.01] transition-transform"
                          loading="lazy"
                        />
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
                                {userData.name?.charAt(0) || <User size={14} />}
                              </div>
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  ref={(ref) =>
                                    (commentInputRefs.current[post.$id] = ref)
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
                                  className="w-full bg-gray-700/50 text-white pl-3 pr-10 py-2 rounded-full border border-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() => handleAddComment(post)}
                                  disabled={!commentTexts[post.$id]?.trim()}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                  <Send size={16} />
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                            {post.comments?.length > 0 ? (
                              post.comments.map((comment) => (
                                <motion.div
                                  key={comment.$id}
                                  className="flex gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                                      {comment.username?.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="flex-1 group">
                                    <div className="bg-gray-750 p-3 rounded-lg border border-gray-700/30">
                                      <div className="flex justify-between">
                                        <p className="font-medium text-indigo-400">
                                          {comment.username}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          {formatDistanceToNow(
                                            new Date(comment.timestamp),
                                            { addSuffix: true }
                                          )}
                                        </p>
                                      </div>
                                      <p className="text-gray-200 mt-1">
                                        {comment.content}
                                      </p>
                                    </div>
                                    <div className="hidden group-hover:flex mt-1 ml-2 gap-2">
                                      <button className="text-xs text-gray-400 hover:text-white">
                                        Reply
                                      </button>
                                      <button className="text-xs text-gray-400 hover:text-white">
                                        Like
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <MessageCircle
                                  size={24}
                                  className="text-gray-500 mb-2"
                                />
                                <p className="text-gray-400">No comments yet</p>
                                <p className="text-gray-500 text-sm mt-1">
                                  Be the first to share your thoughts!
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

      {/* Create Post Floating Button (mobile only) */}
      {userData && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Link
            to="/add-post"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/50 transition-all"
          >
            <PlusCircle size={24} />
          </Link>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.25); }
          30% { transform: scale(1); }
          45% { transform: scale(1.25); }
          60% { transform: scale(1); }
        }
        
        .animate-heartbeat {
          animation: heartbeat 0.8s ease-in-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .bg-gray-750 {
          background-color: #232836;
        }
        
        .bg-gray-850 {
          background-color: #1a1f2c;
        }
     `}</style>
    </div>
  );
}

export default AllPosts;
