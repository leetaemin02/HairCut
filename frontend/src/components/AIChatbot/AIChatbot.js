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

  const predefinedAnswers = {
    "Giá cắt tóc bao nhiêu?": "Giá cắt tóc tại The Blue Blade dao động từ 100K đến 200K tùy theo gói dịch vụ anh/chị chọn ạ. Anh/chị có thể xem thêm chi tiết ở mục Dịch vụ nhé!",
    "Tiệm có những dịch vụ nào?": "Dạ, tiệm có các dịch vụ như: Cắt tóc tạo kiểu, Uốn tóc, Nhuộm tóc thời trang, Cạo râu, và Chăm sóc da mặt (Gội đầu, massage).",
    "Thời gian làm việc của tiệm?": "The Blue Blade mở cửa từ 8:30 sáng đến 9:00 tối các ngày trong tuần. Riêng cuối tuần (Thứ 7, CN) tiệm mở cửa đến 10:00 tối ạ.",
    "Làm sao để đặt lịch?": "Anh/chị có thể đặt lịch ngay bằng cách nhấn vào nút 'Tới trang Đặt Lịch ngay' ở dưới khung chat, hoặc nhấp vào phần 'Đặt lịch' ở menu chính trên website."
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessageText = message.trim();
    const userMessage = {
      role: "user",
      parts: [{ text: userMessageText }],
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");

    // Nếu câu hỏi nằm trong danh sách định trước (if)
    if (predefinedAnswers[userMessageText]) {
      setIsLoading(true);
      // Giả lập thời gian phản hồi một chút cho tự nhiên
      setTimeout(() => {
        const botReply = {
          role: "model",
          parts: [{ text: predefinedAnswers[userMessageText] }],
        };
        setChatHistory((prev) => [...prev, botReply]);
        setIsLoading(false);
      }, 500);
      return; // Dừng tại đây, không gọi API
    }

    // Nếu không (else), gọi API AI để xử lý
    setIsLoading(true);

    try {
      // Get user information if logged in
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // We send the current message, history, and user context
      const response = await api.post("/ai/chat", {
        message: userMessageText,
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

  const handleQuickQuestion = (text) => {
    setMessage(text);
    // Use a small timeout to allow state to update before submit
    setTimeout(() => {
      handleSendMessage({ preventDefault: () => { } });
    }, 100);
  };

  const quickQuestions = [
    "Giá cắt tóc bao nhiêu?",
    "Tiệm có những dịch vụ nào?",
    "Thời gian làm việc của tiệm?",
    "Làm sao để đặt lịch?"
  ];

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
                  Xin chào! Em là trợ lý ảo của The Blue Blade. Em có thể giúp gì cho anh/chị về dịch vụ và giá cả không ạ?
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
              {chatHistory.length === 0 && (
                <div className="ai-quick-questions">
                  <p className="text-xs text-center text-slate-400 mb-2">Câu hỏi thường gặp:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q)}
                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-[#1c2230] p-3 border-t border-[#282a31]">
              <a
                href="/appointments"
                className="block w-full text-center bg-gradient-to-r from-[#1754cf] to-[#003ea7] hover:from-[#1349b8] hover:to-[#003185] text-white py-2 rounded-lg font-bold text-sm shadow-md transition-all mb-2"
              >
                Tới trang Đặt Lịch ngay &rarr;
              </a>
              <form className="ai-chat-input-area border-none pt-0 mt-0" onSubmit={handleSendMessage}>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;