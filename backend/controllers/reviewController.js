const Review = require("../models/Review");
const Appointment = require("../models/Appointment");

// Create a review
exports.createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        
        // Ensure appointment exists and belongs to the customer
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: "Lịch hẹn không tồn tại" });
        if (String(appointment.customerId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Không có quyền đánh giá" });
        }
        if (appointment.status !== "completed") {
            return res.status(400).json({ message: "Chỉ được đánh giá khi lịch hẹn đã hoàn tất" });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ appointmentId });
        if (existingReview) {
            return res.status(400).json({ message: "Lịch hẹn này đã được đánh giá" });
        }

        const newReview = new Review({
            appointmentId,
            customerId: req.user.id,
            barberId: appointment.barberId,
            rating,
            comment
        });

        await newReview.save();
        res.status(201).json({ message: "Đánh giá thành công!", review: newReview });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all reviews (Admin filtered, or by barberId for public)
exports.getReviews = async (req, res) => {
    try {
        const { barberId } = req.query;
        let query = {};
        if (barberId) query.barberId = barberId;

        const reviews = await Review.find(query)
            .populate("customerId", "name profileImage")
            .populate("barberId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get average rating stats per barber (Public - for dashboard display)
exports.getBarberRatingStats = async (req, res) => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: "$barberId",
                    avgRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        // Convert to a map { barberId: { avgRating, reviewCount } }
        const statsMap = {};
        stats.forEach(s => {
            statsMap[String(s._id)] = {
                avgRating: Math.round(s.avgRating * 10) / 10,
                reviewCount: s.reviewCount
            };
        });

        res.status(200).json(statsMap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete review (Admin)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        res.status(200).json({ message: "Đã xóa đánh giá" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
