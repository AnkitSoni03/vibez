import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import appwriteService from "../appwrite/config";
import { Button } from "../components";
import Loader from "../components/Loader";
import { ThumbsUp, MessageCircle, Share2, Bookmark, Calendar, User, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function Post() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const commentInputRef = useRef(null);

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
    
    if (!userData) {
      // Prompt to login if not logged in
      if (window.confirm("Please log in to comment. Go to login page?")) {
        navigate("/login", { state: { from: `/post/${slug}` } });
      }
      return;
    }
    
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

  const handleLike = () => {
    if (!userData) {
      if (window.confirm("Please log in to like posts. Go to login page?")) {
        navigate("/login", { state: { from: `/post/${slug}` } });
      }
      return;
    }
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    // Here you would typically call an API to update the like in your database
  };

  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const sharePost = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (loading) return <Loader />;
  if (!post) return <div className="text-center text-red-500 text-xl mt-10">Post not found</div>;

  const timeAgo = formatDistanceToNow(new Date(post?.$createdAt), { addSuffix: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-400">
        <Link to="/" className="hover:text-blue-400 transition">Home</Link> {" / "}
        <Link to="/posts" className="hover:text-blue-400 transition">Posts</Link> {" / "}
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
            <h1 className="text-4xl font-bold text-white mb-2 leading-tight">{post.Title}</h1>
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

          {/* Action Bar */}
          <div className="flex justify-between border-t border-b border-gray-700 py-4 my-6">
            <div className="flex gap-6">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition ${isLiked ? 'text-blue-400' : 'text-gray-400'} hover:text-blue-400`}
              >
                <ThumbsUp size={20} className={isLiked ? 'fill-current' : ''} />
                <span>{likeCount} Likes</span>
              </button>
              <button 
                onClick={focusCommentInput}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition"
              >
                <MessageCircle size={20} />
                <span>{comments.length} Comments</span>
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={sharePost} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition">
                <Share2 size={20} />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition">
                <Bookmark size={20} />
                <span>Save</span>
              </button>
            </div>
          </div>

          {userData?.$id === post.UserId && (
            <div className="flex gap-4 my-6">
              <Link to={`/edit-post/${post.$id}`} className="block">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6">Edit Post</Button>
              </Link>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Delete Post
              </Button>
            </div>
          )}

          {/* Comments Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <MessageCircle size={24} />
              Comments ({comments.length})
            </h2>

            {/* Add Comment */}
            <div className="mb-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                  {userData ? userData.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex-1">
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={userData ? "Write a comment..." : "Login to comment"}
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm bg-gray-800 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    disabled={!userData}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={!userData || !commentText.trim()}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                        userData && commentText.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <MessageCircle size={40} className="mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {comments.map((comment) => (
                  <div key={comment.$id} className="bg-gray-800 p-4 rounded-xl shadow-sm text-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 flex-shrink-0">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-blue-400">{comment.username}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm mt-2 leading-relaxed">{comment.content}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <button className="hover:text-blue-400 transition">Reply</button>
                          <button className="hover:text-blue-400 transition">Like</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Posts Placeholder - You could implement this feature */}
      <div className="bg-gray-900 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Related Posts</h3>
        <p className="text-gray-400 text-sm">This section could display related posts based on tags or categories.</p>
      </div>
    </div>
  );
}

export default Post;