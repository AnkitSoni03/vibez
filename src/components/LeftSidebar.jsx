import React from "react";
import { Link } from "react-router-dom";
import { User, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { useSelector } from "react-redux";

function LeftSidebar() {
  const userData = useSelector((state) => state.auth.userData);

  if (!userData) return null;

  return (
    <div className="bg-gray-800/70 rounded-xl overflow-hidden shadow-lg border border-gray-700/50 sticky top-20">
      {/* User Profile Card */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-24 bg-gradient-to-r from-indigo-800 to-purple-700"></div>
        
        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-24">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white overflow-hidden shadow-lg border-4 border-gray-800">
            {userData.profilePictureUrl ? (
              <img
                src={userData.profilePictureUrl}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              userData.name?.charAt(0) || <User size={24} />
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-12 px-4 pb-4 text-center">
        <h3 className="text-xl font-bold text-white">{userData.name}</h3>
        <p className="text-gray-400 text-sm mt-1">
          {userData.title || "Community Member"}
        </p>
      </div>

      {/* User Stats */}
      <div className="px-4 pb-2">
        <div className="flex justify-around text-center border-t border-gray-700/50 pt-4">
          <div>
            <p className="text-lg font-bold text-white">128</p>
            <p className="text-xs text-gray-400">Connections</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">42</p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">3.2K</p>
            <p className="text-xs text-gray-400">Views</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm">{userData.location || "Location not set"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Briefcase size={16} className="text-gray-400" />
            <span className="text-sm">{userData.company || "Company not set"}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-4 pb-4">
        <Link
          to={`/`}
          className="block w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center text-sm font-medium transition-colors"
        >
          View Profile
        </Link>
      </div>

      {/* Quick Links */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Links</h4>
        <div className="space-y-2">
          <Link
            to="#"
            className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors text-sm"
          >
            <span>Saved Posts</span>
          </Link>
          <Link
            to="#"
            className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors text-sm"
          >
            <span>Your Drafts</span>
          </Link>
          <Link
            to="#"
            className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors text-sm"
          >
            <span>Account Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;