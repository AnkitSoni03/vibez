import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import {
  MessageCircle,
  ThumbsUp,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function PostCard({
  $id,
  Title,
  Content,
  "Unique-image": imageId,
  UserName,
  $createdAt,
}) {
  const imageUrl = imageId ? appwriteService.getFilePreview(imageId) : "";
  const timeAgo = formatDistanceToNow(new Date($createdAt), {
    addSuffix: true,
  });
  const [likes, setLikes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await appwriteService.getLikes($id);
        setLikes(res.documents || []);
      } catch (err) {
        console.error("Failed to fetch likes:", err);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await appwriteService.getComments($id);
        setCommentCount(res.documents?.length || 0);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };

    fetchLikes();
    fetchComments();
  }, [$id]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Function to extract text content from HTML
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const contentPreview = Content
    ? stripHtml(Content).substring(0, 120) + "..."
    : "";

  return (
    <Link
      to={`/post/${$id}`}
      className="group block rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-xl shadow-md transition-all duration-300 h-full transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <div
          className={`w-full h-52 sm:h-48 md:h-60 bg-gray-900 overflow-hidden ${
            !isLoaded ? "animate-pulse" : ""
          }`}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={Title}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-gray-500">
              No Image Available
            </div>
          )}
          {!isLoaded && imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Category badge - this could be dynamic in the future */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-blue-600/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            Blog
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="space-y-1.5">
          <h2 className="text-white text-xl font-bold line-clamp-2 group-hover:text-blue-400 transition-colors">
            {Title}
          </h2>
          <p className="text-gray-400 text-sm line-clamp-2">{contentPreview}</p>
        </div>

        <div className="pt-2 flex items-center text-xs text-gray-500 space-x-4">
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            <span className="truncate max-w-[100px]">
              {UserName || "Unknown"}
            </span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{timeAgo}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-700/50 mt-3">
          <div className="flex gap-3">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <ThumbsUp
                size={16}
                className={`${likes.length > 0 ? "text-blue-400" : ""}`}
              />
              <span>{likes.length}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MessageCircle size={16} />
              <span>{commentCount}</span>
            </div>
          </div>
          <div className="text-blue-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            Read More{" "}
            <ChevronRight
              size={16}
              className="ml-1 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
