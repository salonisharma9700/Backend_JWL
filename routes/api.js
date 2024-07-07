const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
const FormData = require('../models/ResponseForm');
const UploadVidForm = require('../models/UploadVidForm');
require('dotenv').config(); 
const AdminReviewKM = require('../models/Adminfeedback'); 
const AdminVid = require('../models/AdminVid');
// const emailjs = require('emailjs-com');
const sendOtp = require('../utils/sendOtp');



router.use(express.json());
const mongoURI = process.env.MONGO_URI;

router.use(express.json());
// upload = video upload + form data

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = 'uploads/';
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//         }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });
// const upload = multer({ storage });
// Example in-memory storage (replace with actual database storage in production)
const otpStore = {};

// Route for verifying OTP
router.post('/verify-otp', (req, res) => {
    const { otp, phoneNumber } = req.body;

    console.log('Received OTP verification request:', { otp, phoneNumber });

    // Simulated OTP verification logic
    if (otpStore[phoneNumber] && otpStore[phoneNumber] === otp) {
        console.log('OTP verification successful'); 
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


// //route to uploaadvideo + form data  
// // router.post('/media', upload.single('video'), async (req, res) => {
//     router.post('/media',  async (req, res) => {
//     const formData = req.body;
//     // const videoFile = req.file;

//     // if (!videoFile) {
//     //     return res.status(400).json({ error: 'No file uploaded' });
//     // }

//     // const videoPath = `uploads/${videoFile.filename}`;

//     const formDetails = new Form({
//         childName: formData.childName,
//         age: formData.age,
//         gender: formData.gender,
//         fathersName: formData.fathersName,
//         fathersContact: formData.fathersContact,
//         fathersEmail: formData.fathersEmail,
//         mothersName: formData.mothersName,
//         mothersContact: formData.mothersContact,
//         mothersEmail: formData.mothersEmail,
//         message: formData.message,
//         primaryContact: formData.primaryContact
//         // videoPath: videoPath
//     });

//     try {
//         await formDetails.save();
//         res.status(200).json({ message: 'File uploaded and form data saved successfully' });
//     } catch (error) {
//         res.status(500).json({ error: 'Error saving form data' });
//     }
// });

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

// Update status and feedback
router.patch('/updateFormData/:id', async (req, res) => {
    const { status, feedback } = req.body;
    const { id } = req.params;

    try {
        const updatedForm = await FormData.findByIdAndUpdate(id, { status, feedback }, { new: true });

        if (!updatedForm) {
            return res.status(404).json({ error: 'Form not found' });
        }

        res.status(200).json({ message: 'Status and feedback updated successfully', updatedForm });
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


//get feedback on admin portal for uploadvid


// GET endpoint to fetch form data with sample feedback
// router.get('/getuploadWithFeedback', async (req, res) => {
//     try {
//       const formData = await UploadVidForm.find(); // Fetch all form data from MongoDB using Mongoose
  
//       // Optionally fetch feedback or other related data and construct the response
//       const formDataWithFeedback = formData.map(form => ({
//         ...form.toObject(),
//         status: 'Sample Status',
//         feedback: 'Sample Feedback',
//       }));
  
//       res.status(200).json(formDataWithFeedback); // Respond with JSON data
//     } catch (error) {
//       console.error('Error fetching form data with feedback:', error);
//       res.status(500).json({ error: 'Error fetching form data with feedback' });
//     }
//   });
  // Route to fetch all form data
router.get('/adminmedia', async (req, res) => {
    try {
        const formData = await UploadVidForm.find(); // Fetch all form data from MongoDB

        res.status(200).json(formData); // Respond with JSON data
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).json({ error: 'Error fetching form data' });
    }
});

router.post('/api/saveAdminVidFeedback', async (req, res) => {
    try {
        const { formId, status, feedback } = req.body;

        // Check if there's existing feedback for this formId
        let adminVid = await AdminVid.findOne({ formId });

        if (!adminVid) {
            // If no existing feedback, create a new entry
            adminVid = new AdminVid({ formId, status, feedback });
        } else {
            // If existing feedback, update the status and feedback
            adminVid.status = status;
            adminVid.feedback = feedback;
        }

        await adminVid.save();

        res.status(201).json({ message: 'Status and feedback saved successfully', adminVid });
    } catch (error) {
        console.error('Error saving status and feedback:', error);
        res.status(500).json({ error: 'Failed to save status and feedback' });
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






//cloudinar
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dahddkuei',
    api_key: '739925546548181',
    api_secret: '3Kah7aCCXOP7ThQHMeUxuA3lYcg'
  });
//   const storage = multer.diskStorage({});


const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB file size limit
    }
  });

router.post('/media', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // Upload file to Cloudinary directly from memory buffer
      const cloudinaryResult = await cloudinary.uploader.upload_stream({ resource_type: "video" }, 
        async (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return res.status(500).json({ message: 'Failed to upload video' });
          }
  
          // Save form data including Cloudinary URL
          const formData = {
            childName: req.body.childName,
            age: req.body.age,
            gender: req.body.gender,
            fathersName: req.body.fathersName,
            fathersContact: req.body.fathersContact,
            fathersEmail: req.body.fathersEmail,
            mothersName: req.body.mothersName,
            mothersContact: req.body.mothersContact,
            mothersEmail: req.body.mothersEmail,
            message: req.body.message,
            primaryContact: req.body.primaryContact,
            videoPath: result.secure_url // Store Cloudinary URL in the database
          };
  
          const newFormData = new UploadVidForm(formData);
          await newFormData.save();
  
          res.status(201).json({ message: 'Video uploaded successfully', formData: newFormData });
        }).end(req.file.buffer);
  
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ message: 'Failed to upload video' });
    }
  });

module.exports = router;
