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
        model: "gemini-1.5-pro-latest",
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
    <div className="mt-3">
      {/* Summary Button */}
      <button
        onClick={generateSummary}
        disabled={loading}
        className={`
          bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 
          text-black dark:text-gray-900 font-medium py-1.5 px-4 rounded-md text-sm
          transition-colors duration-200 flex items-center justify-center
          ${loading ? "opacity-80 cursor-not-allowed" : ""}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating
          </>
        ) : (
          "Get AI Summary"
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
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  AI Summary
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              {/* Language Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  onClick={() => setActiveTab("english")}
                  className={`py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === "english"
                      ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveTab("hindi")}
                  className={`py-2 px-4 text-sm font-medium transition-colors ${
                    activeTab === "hindi"
                      ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  हिंदी
                </button>
              </div>
              
              {/* Content based on active tab */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {activeTab === "english" ? (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {summary.english}
                  </p>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {summary.hindi}
                  </p>
                )}
              </div>
              
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium
                    bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                    text-gray-800 dark:text-gray-200 transition-colors
                  `}
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