import mongoose, { Schema, Model } from "mongoose";

interface IMessage {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  message: string;
  date: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref:"Faculty",
      required: true 
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Student",
      required: true
    },
    message: { type: String, required: true },
    date: { type: Date, required: true }
  },
  {
    timestamps: true
  }
);

const Message: Model<IMessage> = mongoose.model("Message", messageSchema);
export default Message;