import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button } from "../components";
import Loader from "../components/Loader";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

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

  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await appwriteService.getComments(post?.$id);
        setComments(res.documents);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };

    if (post?.$id) fetchComments();
  }, [post?.$id]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await appwriteService.addComment(
        post.$id,
        userData?.$id,
        userData?.name,
        commentText
      );
      setCommentText("");
      const updated = await appwriteService.getComments(post.$id);
      setComments(updated.documents);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

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
  if (!post) return <div className="text-center text-red-500 text-xl mt-10">Post not found</div>;

  const timeAgo = formatDistanceToNow(new Date(post?.$createdAt), { addSuffix: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        <img
          src={appwriteService.getFilePreview(post["Unique-image"])}
          alt={post.Title}
          className="w-full h-[400px] object-cover"
        />

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-400 flex justify-between items-center">
            <span>By {post?.UserName || "Unknown"}</span>
            <span>{timeAgo}</span>
          </div>

          <h1 className="text-3xl font-bold text-white">{post.Title}</h1>

          <div
            className="text-gray-300 text-lg leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post?.Content }}
          />

          <div className="flex gap-6 text-gray-400 mt-6">
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <ThumbsUp size={20} /> <span>Like</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <MessageCircle size={20} /> <span>Comment</span>
            </div>
          </div>

          {userData?.$id === post.UserId && (
            <div className="mt-6 flex gap-4">
              <Link to={`/edit-post/${post.$id}`}>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">Edit</Button>
              </Link>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-10 border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-white mb-3">Comments</h2>

            {loadingComments ? (
              <p className="text-gray-500 text-sm">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div key={comment.$id} className="bg-gray-800 p-3 rounded-xl shadow-sm text-gray-200 mb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-blue-400">{comment.username}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {userData && (
              <div className="mt-4 flex gap-2 items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-xl text-sm bg-gray-900 text-white"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
