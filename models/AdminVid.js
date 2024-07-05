const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminvideo = new Schema({
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    childName: { type: String, required: true },
    status: { type: String, required: true },
    feedback: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AdminVid', adminvideo);
