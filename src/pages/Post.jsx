import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button } from "../components";
import Loader from "../components/Loader";
import { Calendar, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      try {
        await appwriteService.deletePost(post.$id);
        await appwriteService.deleteFile(post["Unique-image"]);
        navigate("/");
      } catch (error) {
        console.error("Delete failed:", error);
      }
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-400">
        <Link to="/" className="hover:text-blue-400 transition">
          Home
        </Link>{" "}
        {" / "}
        <Link to="/" className="hover:text-blue-400 transition">
          Posts
        </Link>{" "}
        {" / "}
        <span className="text-gray-300">{post.Title}</span>
      </div>

      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden mb-8">
        <div className="relative">
          <img
            src={appwriteService.getFilePreview(post["Unique-image"])}
            alt={post.Title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-4xl font-bold text-white mb-2 leading-tight">
              {post.Title}
            </h1>
            <div className="flex items-center gap-4 text-gray-300 text-sm">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{post?.UserName || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(post?.$createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div
            className="text-gray-200 text-lg leading-relaxed prose prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post?.Content }}
          />

          {userData?.$id === post.UserId && (
            <div className="flex gap-4 my-6">
              <Link to={`/edit-post/${post.$id}`} className="block">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6">
                  Edit Post
                </Button>
              </Link>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Delete Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Post;
