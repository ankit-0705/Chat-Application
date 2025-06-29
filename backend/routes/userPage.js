const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/userModel');
const picMiddleware = require('../middleware/picLogic');
const jwtMiddleware = require('../middleware/jwtLogic');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage });
const jwt_Token = process.env.jwt_Key;

// Route 1: User Creation
router.post('/register', upload.single('image'), picMiddleware, [
  body('name', 'Enter a valid user name.').isLength({ min: 3 }),
  body('email', 'Enter a valid user email.').isEmail(),
  body('password', 'Enter a valid strong password.').isStrongPassword(),
  body('pnum', 'Phone number must be 10 digits long.').isLength({ min: 10, max: 10 })
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry, a user with this email already exists" });
    }

    let image = null;
    if (req.file) {
      image = {
        data: req.file.buffer,
        mimeType: req.file.mimetype
      };
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // Create and Save user to the database
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
      pnum: req.body.pnum,
      pic: image
    });

    const data = {
      user: {
        id: user.id
      }
    };

    const jwtToken = jwt.sign(data, jwt_Token, { expiresIn: '1h' }); // JWT with expiration
    res.json({
      success: true,
      message: "User successfully added to the database.",
      token: jwtToken
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Route 2: User Authentication (Login)
router.post('/login', [
  body('email', 'Enter a valid user email.').isEmail(),
  body('password', 'Enter a valid strong password.').isStrongPassword()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Login with correct credentials." });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Login with correct credentials." });
    }

    const data = {
      user: {
        id: user.id
      }
    };

    const jwtToken = jwt.sign(data, jwt_Token, { expiresIn: '1h' }); // JWT with expiration
    res.json({ jwtToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Route 3: Fetch User Info
router.post('/getuser', jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Route 4: Search Users
router.get('/search', jwtMiddleware, async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Search query required" });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id }
    }).select('-password -pic.data');

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// Route 5: Send Request
router.post('/send-request', jwtMiddleware, async (req, res) => {
  const { userId } = req.body; // userId to send request to

  if (!userId) return res.status(400).json({ error: 'UserId is required' });

  try {
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(userId);

    if (!receiver) return res.status(404).json({ error: 'User not found' });

    // Check if already contacts
    if (sender.contacts.includes(userId)) {
      return res.status(400).json({ error: 'Already connected' });
    }

    // Check if request already sent
    if (sender.outgoingRequests.includes(userId)) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    // Add to outgoing and incoming requests respectively
    sender.outgoingRequests.push(userId);
    receiver.incomingRequests.push(sender._id);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Request sent successfully' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route 6: Responding to request
router.post('/respond-request', jwtMiddleware, async (req, res) => {
  const { userId, accept } = req.body; // userId is the sender of request

  if (!userId || typeof accept !== 'boolean') {
    return res.status(400).json({ error: 'userId and accept status required' });
  }

  try {
    const receiver = await User.findById(req.user.id);
    const sender = await User.findById(userId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove request from both sides
    receiver.incomingRequests = receiver.incomingRequests.filter(id => id.toString() !== userId);
    sender.outgoingRequests = sender.outgoingRequests.filter(id => id.toString() !== receiver._id.toString());

    if (accept) {
      // Add each other as contacts
      receiver.contacts.push(sender._id);
      sender.contacts.push(receiver._id);
    }

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: accept ? 'Request accepted' : 'Request rejected' });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route 7: Update Profile
router.put('/update-profile', jwtMiddleware, upload.single('image'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, pnum } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (pnum) updateData.pnum = pnum;
    if (req.file) {
      updateData.pic = {
        data: req.file.buffer,
        mimeType: req.file.mimetype
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, user: updatedUser });

  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Phone number already in use' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route 8: Get user by Id
router.get('/getuserbyid/:id', jwtMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -pic.data');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route 9: Remove a Friend
router.delete('/remove-friend/:friendId', jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    // Check both users exist
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from each other's contacts
    user.contacts = user.contacts.filter(id => id.toString() !== friendId);
    friend.contacts = friend.contacts.filter(id => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;