import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function PostCard({ $id, Title, Content, "Unique-image": imageId, UserName, $createdAt }) {
  const imageUrl = imageId ? appwriteService.getFilePreview(imageId) : "";
  const timeAgo = formatDistanceToNow(new Date($createdAt), { addSuffix: true });
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await appwriteService.getLikes($id);
        setLikes(res.documents || []);
      } catch (err) {
        console.error("Failed to fetch likes:", err);
      }
    };

    fetchLikes();
  }, [$id]);

  return (
    <Link
      to={`/post/${$id}`}
      className="block rounded-2xl overflow-hidden bg-gray-800 hover:shadow-lg shadow-md transition-shadow duration-300"
    >
      <div className="w-full h-60 bg-black overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={Title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h2 className="text-white text-xl font-semibold line-clamp-2">{Title}</h2>
        <p className="text-gray-300 text-sm line-clamp-2">{Content}</p>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>By {UserName || "Unknown"}</span>
          <span>{timeAgo}</span>
        </div>

        <div className="flex gap-4 mt-4 text-gray-400">
          <div className="flex items-center gap-1 hover:text-white cursor-pointer">
            <ThumbsUp size={18} /> <span>{likes.length}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-white cursor-pointer">
            <MessageCircle size={18} /> <span>Comments</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
