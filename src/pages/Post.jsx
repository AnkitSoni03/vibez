import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button } from "../components";
import Loader from "../components/Loader";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((res) => {
        setPost(res);
        setLoading(false);
      });
    }
  }, [slug]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
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

  if (!post) {
    return <div className="text-center text-red-500 text-xl mt-10">Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        <img
          src={appwriteService.getFilePreview(post["Unique-image"])}
          alt={post.Title}
          className="w-full h-[350px] object-cover"
        />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-4">{post.Title}</h1>

          {/* ✅ HTML content rendered with styling */}
          <div
            className="text-gray-300 text-lg leading-relaxed mt-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post?.Content }}
          />

          {/* ✅ Show Edit/Delete only to owner */}
          {userData && userData.$id === post.UserId && (
            <div className="mt-6 flex gap-4">
              <Link to={`/edit-post/${post.$id}`}>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  Edit
                </Button>
              </Link>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Post;
