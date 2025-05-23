import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button } from "../components";
import Loader from "../components/Loader";
import { Calendar, User, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((res) => {
        setPost(res);
        setLikeCount(res.likes || 0);
        setLoading(false);
      });
    }
  }, [slug]);

  const handleDelete = async () => {
    try {
      await appwriteService.deletePost(post.$id);
      await appwriteService.deleteFile(post["Unique-image"]);
      navigate("/");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) return <Loader />;

  if (!post)
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Post not found
      </div>
    );

  const timeAgo = formatDistanceToNow(new Date(post?.$createdAt), {
    addSuffix: true,
  });

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400 px-4 pt-4">
        <Link to="/" className="hover:text-blue-400 transition">
          Home
        </Link>{" "}
        {" / "}
        <Link to="/" className="hover:text-blue-400 transition">
          Posts
        </Link>{" "}
        {" / "}
        <span className="text-gray-300 inline-block max-w-[150px] sm:max-w-none truncate align-bottom">
          {post.Title}
        </span>
      </div>

      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden mb-8">
        <div className="relative">
          <img
            src={appwriteService.getFilePreview(post["Unique-image"])}
            alt={post.Title}
            className="w-full h-64 sm:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 sm:p-6">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              {post.Title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <User size={12} className="sm:w-4 sm:h-4" />
                <span>{post?.UserName || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} className="sm:w-4 sm:h-4" />
                <span>{new Date(post?.$createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} className="sm:w-4 sm:h-4" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <div
            className="text-gray-200 text-sm sm:text-lg leading-relaxed prose prose-invert max-w-none mb-6 sm:mb-8"
            dangerouslySetInnerHTML={{ __html: post?.Content }}
          />

          {userData?.$id === post.UserId && (
            <div className="flex flex-wrap gap-2 sm:gap-4 my-4 sm:my-6">
              <Link to={`/edit-post/${post.$id}`} className="block">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base">
                  Edit Post
                </Button>
              </Link>
              <Button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base"
              >
                <Trash2 size={0} />
                Delete Post
              </Button>
              <Link to={`/all-posts`} className="block">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base">
                  Done
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Confirm Deletion</h2>
            <p className="text-gray-300 mb-5">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
