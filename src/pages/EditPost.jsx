import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import PostForm from "../components/post-form/PostForm";
import Loader from "../components/Loader";
import {
  ArrowLeft,
  AlertCircle,
  Save,
  Trash,
  Image,
  FileEdit,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

function EditPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const res = await appwriteService.getPost(id);
          if (res) {
            setPost(res);
            if (res["Unique-image"]) {
              setPreviewImage(
                appwriteService.getFilePreview(res["Unique-image"])
              );
            }
          }
        } catch (error) {
          console.error("Error fetching post:", error);
          toast.error("Failed to load post");
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await Promise.all([
        appwriteService.deletePost(id),
        post["Unique-image"]
          ? appwriteService.deleteFile(post["Unique-image"])
          : Promise.resolve(),
      ]);

      toast.success("Post deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
      setSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 max-w-md text-center border border-gray-700/50 shadow-xl"
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Post Not Found</h2>
          <p className="text-gray-300 mb-6">
            The post you're trying to edit doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Return Home</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-6 sm:py-8 md:py-12 w-full px-1 sm:px-4"
    >
      {/* Top Navigation */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6 flex items-center justify-between px-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden md:inline">Back</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setDeleteConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-xs sm:text-base"
          >
            <Trash size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Mobile Breadcrumb - Mobile Only */}
      <div className="md:hidden max-w-4xl mx-auto mb-3">
        <div className="text-xs text-gray-400 px-4">
          <Link to="/" className="hover:text-blue-400 transition">
            Home
          </Link>{" "}
          {" / "}
          <Link to="/all-posts" className="hover:text-blue-400 transition">
            Posts
          </Link>{" "}
          {" / "}
          <span className="text-gray-300 inline-block max-w-[150px] truncate align-bottom">
            Edit: {post.Title}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Preview Card - Mobile Only improved */}
        {previewImage && (
          <div className="md:hidden mb-4 bg-gray-800/60 rounded-xl overflow-hidden border border-gray-700/50">
            <div className="relative">
              <img
                src={previewImage}
                alt={post.Title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                <div className="p-3">
                  <h3 className="text-lg font-bold text-white">
                    {post.Title}
                  </h3>
                  <h3 className="text-sm text-gray-300">
                    {post.Content}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-3 sm:p-4 md:p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <FileEdit size={18} className="sm:w-5 sm:h-5 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-medium text-white">
              Edit Post Details
            </h3>
          </div>

          {/* Pass the complete post object to PostForm */}
          <PostForm post={post} />
        </motion.div>

        {/* Tips - Mobile styled differently */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-6 bg-indigo-900/30 rounded-xl p-3 sm:p-4 border border-indigo-800/30"
        >
          <h4 className="text-indigo-300 font-medium mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-sm">
            <Image size={14} className="sm:w-4 sm:h-4" />
            <span>Pro Tips</span>
          </h4>
          <ul className="md:hidden text-gray-300 text-xs space-y-1 pl-5 list-disc">
            <li>High-quality images increase engagement</li>
            <li>Use images with a 16:9 aspect ratio</li>
            <li>Keep titles concise but descriptive</li>
          </ul>
          {/* Original content for non-mobile */}
          <p className="hidden md:block text-gray-300 text-sm">
            High-quality images can significantly increase engagement with your
            posts. For best results, use images with a 16:9 aspect ratio.
          </p>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full border border-gray-700 shadow-xl"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Delete Post</h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                {submitting ? "Deleting..." : "Delete"}
                {submitting && <Loader size="sm" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fixed Save Button for Mobile Only */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          form="post-form"
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/50 transition-all"
        >
          {submitting ? <Loader size="sm" /> : <Save size={24} />}
        </button>
      </div>
    </motion.div>
  );
}

export default EditPost;