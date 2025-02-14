import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    connected: {
        type: Boolean,
        default: false
    },
    socketId: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Users", usersSchema);