const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('../models/ResponseForm');
const Form = require('../models/UploadVidForm');
require('dotenv').config(); 
const AdminReviewKM = require('../models/Adminfeedback'); 
const AdminVid = require('../models/AdminVid');
// const emailjs = require('emailjs-com');
const sendOtp = require('../utils/sendOtp');

router.use(express.json());
const mongoURI = process.env.MONGO_URI;

router.use(express.json());
// upload = video upload + form data

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });
// Example in-memory storage (replace with actual database storage in production)
const otpStore = {};

// Route for verifying OTP
router.post('/verify-otp', (req, res) => {
    const { otp, phoneNumber } = req.body;

    console.log('Received OTP verification request:', { otp, phoneNumber });

    // Simulated OTP verification logic
    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
        console.log('OTP verification successful');
        // Clear OTP after successful verification
        delete otpStore[phoneNumber];
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } else {
        console.log('Invalid OTP');
        res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }
});

// Route for generating and sending OTP
router.post('/generate-otp', async (req, res) => {
    let { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // Simulate generating OTP
    const otp = generateOtp();

    // Store OTP dynamically with phone number
    otpStore[phoneNumber] = otp;

    // Simulate sending OTP (replace with actual sending logic)
    try {
        await sendOtp(phoneNumber, otp);
        console.log(`Sending OTP ${otp} to ${phoneNumber}`);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Function to generate OTP
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generate OTP as a string
};


//route to uploaadvideo + form data  
router.post('/media', upload.single('video'), async (req, res) => {
    const formData = req.body;
    const videoFile = req.file;

    if (!videoFile) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const videoPath = `uploads/${videoFile.filename}`;

    const formDetails = new Form({
        childName: formData.childName,
        age: formData.age,
        gender: formData.gender,
        fathersName: formData.fathersName,
        fathersContact: formData.fathersContact,
        fathersEmail: formData.fathersEmail,
        mothersName: formData.mothersName,
        mothersContact: formData.mothersContact,
        mothersEmail: formData.mothersEmail,
        message: formData.message,
        primaryContact: formData.primaryContact,
        videoPath: videoPath
    });

    try {
        await formDetails.save();
        res.status(200).json({ message: 'File uploaded and form data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving form data' });
    }
});

//get uploadform  content in admin portal

router.get('/forms', async (req, res) => {
    try {
        const forms = await Form.find();
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving form data' });
    }
});

//save knowmore = form + Video responses

router.post('/submitFormData', async (req, res) => {
    try {
        const {
            childName,
            age,
            gender,
            fathersName,
            fathersContact,
            fathersEmail,
            mothersName,
            mothersContact,
            mothersEmail,
            message,
            videoResponses
        } = req.body;

        if (!childName || !age || !gender || !fathersName || !fathersContact || !fathersEmail || !mothersName || !mothersContact || !mothersEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newFormData = new FormData({
            childName,
            age,
            gender,
            fathersName,
            fathersContact,
            fathersEmail,
            mothersName,
            mothersContact,
            mothersEmail,
            message,
            videoResponses
        });

        await newFormData.save();
        res.status(200).json({ message: 'Form data submitted successfully' });
    } catch (error) {
        console.error('Error submitting form data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// get knowmore data in admin portal

router.get('/getFormData', async (req, res) => {
    try {
        const formData = await FormData.find();
        res.status(200).json(formData);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching form data' });
    }
});


//admin portal

// Update knowmore status and feedback
router.patch('/updateFormData/:id', async (req, res) => {
    const { status, feedback } = req.body;
    const { id } = req.params;

    try {
        const form = await FormData.findById(id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const adminReview = new AdminReviewKM({
            formId: id,
            childName: form.childName,
            status,
            feedback
        });

        await adminReview.save();

        res.status(200).json({ message: 'Status and feedback updated successfully' });
    } catch (error) {
        console.error('Error updating form data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

//get feedback on admin portal for knowmore

router.get('/getFormDataWithFeedback', async (req, res) => {
    try {
        const formData = await FormData.find();

        const formDataWithFeedback = await Promise.all(formData.map(async (form) => {
            const feedback = await AdminReviewKM.findOne({ formId: form._id });
            return {
                ...form.toObject(),
                status: feedback ? feedback.status : 'No status',
                feedback: feedback ? feedback.feedback : 'No feedback', 
            };
        }));

        res.status(200).json(formDataWithFeedback);
    } catch (error) {
        console.error('Error fetching form data with feedback:', error);
        res.status(500).json({ error: 'Error fetching form data with feedback' });
    }
});


//admin feedback uploadvid

router.get('/getAdminVidFeedback/:id', async (req, res) => {
    const { id } = req.params;

    try {
        console.log(`Fetching feedback for formId: ${id}`);
        const feedback = await AdminVid.findOne({ formId: id });

        if (!feedback) {
            console.error(`Feedback not found for formId: ${id}`);
            return res.status(404).json({ error: 'Feedback not found' });
        }

        console.log(`Feedback found: ${JSON.stringify(feedback)}`);
        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error fetching feedback for formId:', id, 'Error:', error);
        res.status(500).json({ error: 'Error fetching feedback' });
    }
});


// Update upload feedback in AdminVid collection

// Update upload feedback in AdminVid collection
router.patch('/updateFeedback/:id', async (req, res) => {
    const { status, feedback } = req.body;
    const { id } = req.params;

    try {
        const updatedForm = await AdminVid.findByIdAndUpdate(
            id,
            { status, feedback },
            { new: true }
        );
        if (!updatedForm) {
            return res.status(404).json({ error: 'Form not found' });
        }
        res.json({ updatedForm }); // Ensure we return an object with updatedForm
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ error: 'Error updating feedback' });
    }
});


// Route to update status and feedback in AdminVid collection
router.patch('/adminvidfeedback/:id', async (req, res) => {
    const { status, feedback } = req.body;
    const { id } = req.params;

    try {
        const form = await FormData.findById(id);
        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        const adminReview = new AdminVid({
            formId: id,
            childName: form.childName,
            status,
            feedback
        });
        await adminReview.save();

        res.status(200).json({ message: 'Status and feedback updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});




// POST route for submitting contact form
// router.post('/contactform', async (req, res) => {
//     const { name, email, message } = req.body;

//     try {
//         // Validate required fields
//         if (!name || !email || !message) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         // Save form data to MongoDB
//         const contactForm = new ContactForm({
//             name,
//             email,
//             message,
//         });
//         await contactForm.save();

//         // Optionally send thank-you email
//         const emailParams = {
//             from_name: 'JoyWithLearning.com',  // Replace with your name or company name
//             from_email: 'joywithlearning.tad@gmail.com',  // Replace with your email address
//             to_email: email,  // Use sender's email address for thank-you email
//             message: 'Thank you we recieved your message!',  // Customize your thank-you message here
//         };
//         const serviceId = 'service_v1786bs'; 
//         const templateId = 'template_cavtrlg';
//         const userId = '3NQW95XFCjHuG4uZl';

//         const response = await emailjs.send(serviceId, templateId, emailParams, userId);
//         console.log('Thank-you email sent successfully:', response);

//         res.status(200).json({ message: 'Form data saved successfully' });
//     } catch (error) {
//         console.error('Error saving form data:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });


module.exports = router;
