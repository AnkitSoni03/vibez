import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import conf from "../conf/conf.js";
import { Loader2 } from "lucide-react"; 

const AISummary = ({ content }) => {
  const [summary, setSummary] = useState({ english: "", hindi: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("english");

  const generateSummary = async () => {
    if (!content) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const genAI = new GoogleGenerativeAI(conf.geminiApiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });
      
      const prompt = `
        Provide a concise summary of the following content in two languages:
        1. First, provide a 3-4 sentence summary in English
        2. Then, provide a 3-4 sentence summary in Hindi (use Devanagari script)
        
        Format your response like this:
        [ENGLISH]
        English summary here...
        
        [HINDI]
        Hindi summary here...
        
        Here's the content to summarize:
        ${content}
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response to extract English and Hindi summaries
      const englishMatch = text.match(/\[ENGLISH\]([\s\S]*?)(?=\[HINDI\]|\[|$)/i);
      const hindiMatch = text.match(/\[HINDI\]([\s\S]*?)(?=\[|$)/i);
      
      const englishSummary = englishMatch ? englishMatch[1].trim() : "Summary not available in English.";
      const hindiSummary = hindiMatch ? hindiMatch[1].trim() : "हिंदी में सारांश उपलब्ध नहीं है।";
      
      setSummary({
        english: englishSummary,
        hindi: hindiSummary
      });
      setShowModal(true);
    } catch (err) {
      console.error("Error generating summary:", err);
      setError("Failed to generate summary. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {/* Elegant Summary Button with Magic Brush Icon */}
      <button
        onClick={generateSummary}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 
          bg-indigo-600 hover:bg-indigo-700
          text-white text-sm font-medium
          py-1.5 px-3 rounded-md
          transition-colors duration-200 shadow-sm
          ${loading ? "opacity-80 cursor-not-allowed" : ""}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {/* Magic Brush Icon */}
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
            </svg>
            <span>Get AI Summary</span>
          </>
        )}
      </button>
  
      {/* Error Message */}
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-1.5">
          {error}
        </p>
      )}
  
      {/* Modal Popup with Language Tabs */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full shadow-xl border border-gray-800">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-base text-white flex items-center">
                  {/* Magic Brush Icon */}
                  <svg
                    className="h-4 w-4 mr-2 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                  AI Summary
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* Language Tabs with Subtle Highlight */}
              <div className="flex border-b border-gray-800 mb-4">
                <button
                  onClick={() => setActiveTab("english")}
                  className={`py-1.5 px-3 text-sm font-medium transition-colors ${
                    activeTab === "english"
                      ? "border-b-2 border-indigo-500 text-indigo-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveTab("hindi")}
                  className={`py-1.5 px-3 text-sm font-medium transition-colors ${
                    activeTab === "hindi"
                      ? "border-b-2 border-indigo-500 text-indigo-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  हिंदी
                </button>
              </div>
              
              {/* Content with subtle background */}
              <div className="prose prose-sm prose-invert max-w-none bg-gray-800/50 rounded-md p-3">
                {activeTab === "english" ? (
                  <p className="text-gray-300 whitespace-pre-line text-sm">
                    {summary.english}
                  </p>
                ) : (
                  <p className="text-gray-300 whitespace-pre-line text-sm">
                    {summary.hindi}
                  </p>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISummary;