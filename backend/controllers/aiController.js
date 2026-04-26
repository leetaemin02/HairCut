const Groq = require("groq-sdk");
const Service = require("../models/Service");
const User = require("../models/User");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.chatWithAI = async (req, res) => {
  try {
    const { message, history, user } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. Fetch current services for context
    const services = await Service.find({ isActive: true });
    const barbers = await User.find({ role: "barber" });

    const servicesContext = services.map(s =>
      `- ${s.name}: Giá ${s.price.toLocaleString('vi-VN')} VNĐ, Thời gian dự kiến: ${s.duration} phút. Mô tả: ${s.description || 'N/A'}`
    ).join("\n");

    const barbersContext = barbers.map(b =>
      `- ${b.name}: Chuyên gia về ${b.specialty ? b.specialty.join(', ') : 'N/A'}`
    ).join("\n");

    // Check login status
    const isLoggedIn = !!user;
    const userName = isLoggedIn ? user.name : "Khách";

    // 2. Prepare System Instructions
    const systemInstruction = `
      Bạn là Trợ lý ảo của tiệm cắt tóc "The Blue Blade". 
      Tên người dùng: ${userName}
      Trạng thái: ${isLoggedIn ? "Đã đăng nhập" : "Chưa đăng nhập (Khách vãng lai)"}

      PHONG CÁCH PHỤC VỤ:
      - Xưng hô: Gọi khách hàng là "${isLoggedIn ? user.name : "Anh/Chị"}", tự xưng là "The Blue Blade" hoặc "Em". 
      - Giọng văn: ngắn gọn, súc tích, lịch sự, LUÔN LUÔN xưng hô "Em/em/chúng em/bên em/cửa hàng/tiệm tóc".
      ${isLoggedIn ? "- Hãy thỉnh thoảng nhắc tên khách hàng để tạo sự thân thiết." : "- Vì khách chưa đăng nhập, hãy xưng hô lịch sự bằng Anh/Chị."}

      DANH SÁCH DỊCH VỤ CỦA CHÚNG EM:
      ${servicesContext}

      DANH SÁCH THỢ CẮT TÓC/ BARBER CỦA CHÚNG EM:
      ${barbersContext}

      QUY TẮC PHẢN HỒI (BẮT BUỘC):
      - TRẢ LỜI NGẮN: Mỗi lần trả lời không quá 5-7 câu. Không chào hỏi rườm rà ở mọi tin nhắn.
      - BÁO GIÁ NHANH: Nếu khách hỏi giá, LUÔN LUÔN trả lời Dạ Anh + Tên dịch vụ + Giá + Thời gian.
      - ĐẶT LỊCH: 
        + Nếu CHƯA đăng nhập: Chỉ được cung cấp thông tin, YÊU CẦU khách phải Đăng Nhập thì mới có thể đặt lịch hẹn.
        + Nếu ĐÃ đăng nhập: Khuyến khích khách đặt lịch ngay tại Trang chủ.
      - KHÔNG LAN MAN: Không giải thích quá nhiều về quy trình trừ khi khách hỏi chi tiết.
      - TRÁNH TỪ THỪA: Bỏ qua các câu như "Tôi có thể giúp gì thêm không?" nếu không cần thiết.
    `;

    // 3. Map Gemini-style history to Groq/OpenAI-style
    const messages = [
      { role: "system", content: systemInstruction }
    ];

    if (history && Array.isArray(history)) {
      history.forEach(item => {
        // Map role 'model' to 'assistant'
        const role = item.role === "model" ? "assistant" : item.role;
        // Map parts[0].text to content
        const content = item.parts && item.parts[0] ? item.parts[0].text : "";

        if (content) {
          messages.push({ role, content });
        }
      });
    }

    // Add final user message
    messages.push({ role: "user", content: message });

    // 4. Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này.";

    res.status(200).json({
      reply: reply,
    });
  } catch (error) {
    console.error("Groq AI Chat Error:", error);

    // Handle Rate Limits (429) specifically
    if (error.status === 429) {
      return res.status(429).json({
        message: "Hệ thống đang bận một chút. Bạn vui lòng đợi 30 giây rồi thử lại nhé!"
      });
    }

    res.status(500).json({ message: "Trợ lý AI hiện không khả dụng. Vui lòng thử lại sau." });
  }
};
