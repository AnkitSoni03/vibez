import React from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";

function PostCard({ $id, Title, "Unique-image": imageId }) {
  const imageUrl = imageId ? appwriteService.getFilePreview(imageId) : "";

  return (
    <Link
      to={`/post/${$id}`}
      className="block rounded-2xl overflow-hidden shadow-lg bg-gray-800 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="w-full h-56 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={Title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-white text-xl font-semibold mb-2 line-clamp-2">
          {Title}
        </h2>
      </div>
    </Link>
  );
}

export default PostCard;