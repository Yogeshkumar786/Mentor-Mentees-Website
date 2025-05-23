import mongoose, { Schema, Model } from "mongoose";

interface IMessage {
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  date: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true }
  },
  {
    timestamps: true // optional, for createdAt and updatedAt
  }
);

// Create and export the model
const Message: Model<IMessage> = mongoose.model("Message", messageSchema);

export default Message;