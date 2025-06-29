const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const jwtMiddleware = require('../middleware/jwtLogic');

// Route 1: Access/Create chats
router.post('/access', jwtMiddleware, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'UserId param is not sent.' });
  }

  try {
    const currentUser = await User.findById(req.user.id);

    // ✅ Prevent chat access if not in mutual contacts
    if (!currentUser.contacts.includes(userId)) {
      return res.status(403).json({ error: 'You can only chat with connected users.' });
    }

    const users = [req.user.id, userId];
    const uniqueUsers = [...new Set(users)];

    // ✅ Check if chat already exists
    let existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: uniqueUsers, $size: 2 }
    }).populate('users', '-password -pic.data')
      .populate('latestMessage');

    existingChat = await User.populate(existingChat, {
      path: 'latestMessage.sender',
      select: 'name email'
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // ✅ Create new chat if not found
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: uniqueUsers
    };

    const newChat = await Chat.create(chatData);
    const fullChat = await Chat.findById(newChat._id).populate('users', '-password -pic.data');

    res.status(200).json(fullChat);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});


// Route 2: Fetch Chats
router.get('/fetch', jwtMiddleware, async (req, res)=>{
    try {
        const chats = await Chat.find({ users: { $in: [req.user.id] } })
      .populate("users", "-password -pic.data")
      .populate("groupAdmin", "-password -pic.data")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

      const fullChats = await User.populate(chats, {
        path: 'latestMessage.sender',
        select: 'name email'
      });
      res.status(200).json(fullChats);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error." });
      }
});

// Route 3: Create Group Chats
router.post('/creategroup', jwtMiddleware, async (req,res)=>{
    const {users, name} = req.body;

    if(!users || !name){
        return res.status(400).json({ error: 'Please provide group name and users.'});
    }

    if (users.includes(req.user.id)) {
      return res.status(400).json({ error: 'You are already in the users list' });
    }

    //Adding user to the group
    users.push(req.user.id);

    try {
        const groupChat = await Chat.create({
            chatName: name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user.id
        });

        const fullGroupChat = await Chat.findById(groupChat._id).populate('users', '-password -pic.data').populate('groupAdmin', '-password -pic.data');
        res.status(200).json(fullGroupChat);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error." });
      }
})

// Route 4: Rename Group 
router.put("/renamegroup", jwtMiddleware, async (req, res) => {
    const { chatId, chatName } = req.body;
  
    if (!chatId || !chatName) {
      return res.status(400).json({ error: "chatId and new chatName are required" });
    }
  
    try {
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName },
        { new: true }
      )
      .populate("users", "-password -pic.data")
      .populate("groupAdmin", "-password -pic.data");
  
      if (!updatedChat) {
        return res.status(404).json({ error: "Chat not found" });
      }
  
      res.status(200).json(updatedChat);
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal Server Error." });
    }
});
  
// Route 5: Remove from Group
router.put("/groupremove", jwtMiddleware, async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ error: "chatId and userId are required" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Optional: Restrict to only admin can remove others
    if (chat.groupAdmin.toString() !== req.user.id && userId !== req.user.id) {
      return res.status(403).json({ error: "Only group admin can remove other users." });
    }

    // 🛠️ Reassign group admin if the removed user is the current admin
    if (chat.groupAdmin.toString() === userId) {
      const remainingUsers = chat.users.filter(u => u.toString() !== userId);
      if (remainingUsers.length > 0) {
        chat.groupAdmin = remainingUsers[0]; // assign new admin
      }
    }

    // Remove the user from group
    chat.users = chat.users.filter(u => u.toString() !== userId);

    const updatedChat = await chat.save();

    const populatedChat = await Chat.findById(updatedChat._id)
      .populate("users", "-password -pic.data")
      .populate("groupAdmin", "-password -pic.data");

    res.status(200).json(populatedChat);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});
  
// Route 6: Add to Group
router.put("/groupadd", jwtMiddleware, async (req, res) => {
    const { chatId, userId } = req.body;
  
    if (!chatId || !userId) {
      return res.status(400).json({ error: "chatId and userId are required" });
    }
  
    try {
      const chat = await Chat.findById(chatId);
  
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
  
      // Only group admin can add users
      if (chat.groupAdmin.toString() !== req.user.id) {
        return res.status(403).json({ error: "Only group admin can add users." });
      }
  
      // Prevent duplicates
      if (chat.users.includes(userId)) {
        return res.status(400).json({ error: "User is already in the group." });
      }
  
      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
      )
      .populate("users", "-password -pic.data")
      .populate("groupAdmin", "-password -pic.data");
  
      res.status(200).json(updatedChat);
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Internal Server Error." });
    }
});

// Route 7: Delete Chat
router.delete("/remove-chat/:userId", jwtMiddleware, async (req, res) => {
  const currentUserId = req.user.id;
  const otherUserId = req.params.userId;

  try {
    const chat = await Chat.findOneAndDelete({
      isGroupChat: false,
      users: { $all: [currentUserId, otherUserId], $size: 2 }
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Optionally delete all messages in that chat as well
    await Message.deleteMany({ chat: chat._id });

    res.status(200).json({ message: "Chat and messages deleted successfully" });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route 8: Group Info
router.get('/my-groups', jwtMiddleware, async (req, res) => {
  try {
    const groups = await Chat.find({
      isGroupChat: true,
      users: req.user.id
    }).select('-latestMessage');

    res.json(groups);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route 9: Leave the group
router.post('/leave-group/:groupId', jwtMiddleware, async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;

  try {
    const group = await Chat.findById(groupId);
    if (!group || !group.isGroupChat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove user from group
    group.users = group.users.filter(id => id.toString() !== userId);
    if (group.groupAdmin?.toString() === userId && group.users.length > 0) {
      group.groupAdmin = group.users[0]; // Optionally assign a new admin
    }
    await group.save();

    // Delete user's messages in the group
    await Message.deleteMany({ chat: groupId, sender: userId });

    res.status(200).json({ message: 'Left group and deleted your messages.' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;