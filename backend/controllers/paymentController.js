const crypto = require("crypto");
const qs = require("qs");
const Appointment = require("../models/Appointment");

// Chuẩn hóa hàm sortObject theo đúng tài liệu VNPAY
// Standardized sortObject per VNPAY 2.1.0 requirements
function sortObject(obj) {
    let sorted = {};
    let str = Object.keys(obj).sort();
    for (let key of str) {
        sorted[key] = obj[key];
    }
    return sorted;
}

// Function to format Vietnam time (GMT+7)
function formatVNTime(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return date.getFullYear().toString() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

exports.createPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId).populate("serviceId");

        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        if (appointment.status !== "confirmed") return res.status(400).json({ message: "Only confirmed appointments can be paid." });
        if (appointment.paymentStatus === "paid") return res.status(400).json({ message: "Appointment is already paid." });

        // AUTOMATIC CONFIGURATION DETECTION
        // Use environment variables if set, otherwise fallback to VNPAY test accounts
        const tmnCode = process.env.VNPAY_TMN_CODE || "CPY02998";
        const hashSecret = process.env.VNPAY_HASH_SECRET || "XNMCOIZCDYJTTAVMSIUBYFVMNCOYFCCO";

        // Auto-detect return URL if not set or if it points to localhost in production
        let returnUrl = process.env.VNPAY_RETURN_URL;
        const currentHost = req.headers.host; // e.g., hair-cut-backend.vercel.app
        const protocol = req.headers['x-forwarded-proto'] || 'http';

        if (!returnUrl || returnUrl.includes('localhost')) {
            returnUrl = `${protocol}://${currentHost}/api/payment/vnpay-return`;
        }

        const url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

        console.log("VNPAY Config Used:", { tmnCode, returnUrl, detectedHost: currentHost });

        const amount = Math.round(appointment.totalPrice) * 100;
        const txnRef = appointment.appointmentId;

        // GMT+7 Time handling
        const date = new Date();
        const vnOffset = 7 * 60 * 60 * 1000;
        const localOffset = date.getTimezoneOffset() * 60000;
        const vnDate = new Date(date.getTime() + localOffset + vnOffset);

        const createDate = formatVNTime(vnDate);
        const expireDateObj = new Date(vnDate.getTime() + 15 * 60 * 1000);
        const expireDate = formatVNTime(expireDateObj);

        let vnpParams = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode.trim(),
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': txnRef,
            'vnp_OrderInfo': 'Thanh toan don hang ' + txnRef,
            'vnp_OrderType': 'other',
            'vnp_Amount': amount,
            'vnp_ReturnUrl': returnUrl.trim(),
            'vnp_IpAddr': req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1',
            'vnp_CreateDate': createDate,
            'vnp_ExpireDate': expireDate
        };

        // 1. Sort objects correctly
        vnpParams = sortObject(vnpParams);

        // 2. Generate sign data (NO encoding)
        const signData = qs.stringify(vnpParams, { encode: false });

        // 3. Generate Secure Hash
        const hmac = crypto.createHmac("sha512", hashSecret.trim());
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnpParams['vnp_SecureHash'] = signed;

        // 4. Generate Final URL (WITH encoding)
        const paymentUrl = url + '?' + qs.stringify(vnpParams, { encode: true });

        res.status(200).json({ payUrl: paymentUrl });
    } catch (error) {
        console.error("[VNPAY createPayment Error]:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Return URL handler
exports.handleReturn = async (req, res) => {
    try {
        let vnpParams = req.query;
        let secureHash = vnpParams['vnp_SecureHash'];

        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        const hashSecret = process.env.VNPAY_HASH_SECRET || "XNMCOIZCDYJTTAVMSIUBYFVMNCOYFCCO";

        vnpParams = sortObject(vnpParams);
        const signData = qs.stringify(vnpParams, { encode: false });

        const hmac = crypto.createHmac("sha512", hashSecret.trim());
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

        if (secureHash === signed) {
            const responseCode = vnpParams['vnp_ResponseCode'];
            const txnRef = vnpParams['vnp_TxnRef'];

            if (responseCode === "00") {
                await Appointment.findOneAndUpdate({ appointmentId: txnRef }, { paymentStatus: "paid" });
                return res.redirect(`${frontendUrl}/profile?payment=success&ref=${txnRef}`);
            } else {
                return res.redirect(`${frontendUrl}/profile?payment=failed&code=${responseCode}`);
            }
        } else {
            return res.redirect(`${frontendUrl}/profile?payment=invalid`);
        }
    } catch (error) {
        console.error("[VNPAY handleReturn Error]:", error);
        res.status(500).json({ message: "Server error handling VNPAY return" });
    }
};

// IPN URL handler
exports.handleIPN = async (req, res) => {
    try {
        let vnpParams = req.query;
        let secureHash = vnpParams['vnp_SecureHash'];

        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        const hashSecret = process.env.VNPAY_HASH_SECRET || "XNMCOIZCDYJTTAVMSIUBYFVMNCOYFCCO";

        vnpParams = sortObject(vnpParams);
        const signData = qs.stringify(vnpParams, { encode: false });

        const hmac = crypto.createHmac("sha512", hashSecret.trim());
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            const txnRef = vnpParams['vnp_TxnRef'];
            const responseCode = vnpParams['vnp_ResponseCode'];

            const appt = await Appointment.findOne({ appointmentId: txnRef });
            if (!appt) return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            if (appt.paymentStatus === 'paid') return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });

            if (responseCode === "00") {
                await Appointment.findOneAndUpdate({ appointmentId: txnRef }, { paymentStatus: "paid" });
            }
            return res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
        }
    } catch (error) {
        console.error("[VNPAY IPN Error]:", error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};
