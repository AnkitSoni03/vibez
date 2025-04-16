import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Users, BadgeInfo, ExternalLink, TrendingUp, Zap } from "lucide-react";

function RightSidebar() {
  const trendingTopics = [
    "Web Development",
    "Mobile Apps",
    "UI/UX Design",
    "JavaScript",
    "React.js"
  ];
  
  return (
    <div className="space-y-6 sticky top-20">
      {/* Company Info */}
      <div className="bg-gray-800/70 rounded-xl overflow-hidden shadow-lg border border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            About Vibez
          </h3>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <div className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center mb-4 px-6">
            <img
                src="./vibez-logo.png"
                alt="logo"
                className="w-10 h-10 object-contain rounded-md shadow-md"
              />
              <h2 className="text-2xl font-bold text-white pl-2">Vibez</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Vibez is a community platform for developers and tech enthusiasts to share knowledge,
              connect with like-minded individuals, and grow their professional network.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">25,000+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">500+ Daily Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeInfo size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">Founded 2023</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Join Pro */}
      <div className="bg-gradient-to-br from-indigo-800 to-purple-700 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">Upgrade to Vibez Pro</h3>
          <p className="text-gray-200 text-sm mb-4">
            Get exclusive access to premium features, advanced analytics, and connect with industry leaders.
          </p>
          <button className="w-full py-2 bg-white text-indigo-800 rounded-lg text-center text-sm font-medium hover:bg-gray-100 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;