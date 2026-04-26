const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Appointment = require('./models/Appointment');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const user = await User.findOne({ email: 'nam123@gmail.com' });
        if (!user) { console.log('User not found!'); process.exit(); }

        console.log(`User found: ${user.name} | ID: ${user._id} | Role: ${user.role}`);

        const appointments = await Appointment.find({ customerId: user._id });
        console.log(`\nTotal appointments: ${appointments.length}`);

        // Show all distinct statuses
        const statusGroups = {};
        appointments.forEach(a => {
            statusGroups[a.status] = (statusGroups[a.status] || 0) + 1;
        });
        console.log('\nStatus breakdown:', statusGroups);

        process.exit();
    })
    .catch(err => { console.error(err); process.exit(1); });
