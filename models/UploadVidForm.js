const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formSchema = new Schema({
    childName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    fathersName: { type: String, required: true },
    fathersContact: { type: String, required: true },
    fathersEmail: { type: String, required: true },
    mothersName: { type: String, required: true },
    mothersContact: { type: String, required: true },
    mothersEmail: { type: String, required: true },
    message: { type: String },
    primaryContact: {type: String, required: true},
    videoPath: { type: String, required: true }
}, {
    timestamps: true 
});
module.exports = mongoose.model('UploadVidForm', formSchema);

