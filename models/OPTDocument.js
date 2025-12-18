const mongoose = require('mongoose');

const OPTDocumentSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        employeeId: { type: String, ref: 'Employee', required: true },

        
    },
    { timestamps: true }
)

module.exports = mongoose.model('OPTDocument', OPTDocumentSchema);