import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import "./AIChatbot.css";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      parts: [{ text: message }],
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Get user information if logged in
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // We send the current message, history, and user context
      const response = await api.post("/ai/chat", {
        message: message,
        history: chatHistory,
        user: user // Pass user object (contains name, etc.)
      });

      const botReply = {
        role: "model",
        parts: [{ text: response.data.reply }],
      };

      setChatHistory((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.message || "Rất tiếc, tôi đang gặp chút sự cố kết nối. Bạn vui lòng thử lại sau nhé!";
      setChatHistory((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: errorMessage }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chatbot-container">
      {/* Floating Button */}
      <motion.button
        className="ai-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className="ai-chat-header">
              <div className="ai-chat-title">
                <div className="ai-online-dot"></div>
                <span>The Blue Blade Assistant</span>
              </div>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className="ai-chat-messages">
              {/* Static Welcome Message */}
              <div className="ai-message bot">
                <div className="ai-message-content">
                  Xin chào! Tôi là trợ lý ảo của The Blue Blade. Tôi có thể giúp gì cho bạn về dịch vụ và giá cả không?
                </div>
              </div>

              {chatHistory.map((msg, index) => (
                <div key={index} className={`ai-message ${msg.role === "user" ? "user" : "bot"}`}>
                  <div className="ai-message-content">
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="ai-message bot">
                  <div className="ai-message-content loading">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="ai-chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !message.trim()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;
