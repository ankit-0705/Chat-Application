const express = require('express');
const router = express.Router();
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const jwtMiddleware = require('../middleware/jwtLogic');


// Route 1: Send Messages
router.post("/send", jwtMiddleware, async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    return res.status(400).json({ error: "Chat ID and content are required" });
  }

  try {
    // Create the new message
    let newMessage = new Message({
      sender: req.user.id,
      content,
      chat: chatId
    });

    // Save the message
    newMessage = await newMessage.save();

    // 🔥 Populate the sender field immediately after saving
    newMessage = await newMessage.populate("sender", "name email pic");

    // (Optional) You can also populate chat if needed:
    // newMessage = await newMessage.populate("chat");

    // Update the latestMessage field in the Chat document
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { latestMessage: newMessage._id },
      { new: true }
    ).populate("users", "-password -pic.data");

    res.status(200).json({ message: newMessage, chat: updatedChat });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});


// Route 2: Fetching all messages
router.get("/fetch", jwtMiddleware, async (req, res) => {
    const { chatId } = req.query;
  
    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    try {
      const messages = await Message.find({ chat: chatId })
        .populate("sender", "name email pic")
        .sort({ createdAt: 1 }); // Sort messages in chronological order

      res.status(200).json(messages);
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal Server Error." });
    }
  });

// Route 3: Delete all messages in a chat
router.delete("/delete", jwtMiddleware, async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ error: "Chat ID is required" });
  }

  try {
    // Optional: Check if user is part of the chat or group admin

    // Delete messages
    await Message.deleteMany({ chat: chatId });

    // Clear latestMessage reference in the chat
    await Chat.findByIdAndUpdate(chatId, { $unset: { latestMessage: "" } });

    res.status(200).json({ message: "All messages deleted successfully." });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});


module.exports = router;