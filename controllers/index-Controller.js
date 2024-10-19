 
   const userModel = require('../models/userModel') 
   const postModel = require('../models/postModel');
   const chatModel = require('../models/chatModel');
    const bcrypt= require('bcrypt');
    const jwt = require('jsonwebtoken');
    const regex = require("regex")
   

 module.exports.landingPageController = function(req,res){
    res.render("index"); 
}


module.exports.postregisterController = async function(req,res){
    let{email,password,age,name,username}=req.body;
        

 try{
    
  let user =  await  userModel.findOne({email});

  if(user) return res.send("you aleready have an account..");

  let salt= await bcrypt.genSalt(10)
  let hashed = await bcrypt.hash(password,salt);

   user = await userModel.create({
    email,name,age,password:hashed,username
  })

  console.log(user);
  

  let token = jwt.sign({email: user.email, id:user._id},process.env.JWT_KEY)
//   console.log(user);
  
  res.cookie("token",token);
  res.redirect("/dashboard");

}

catch(err){
    res.send(err.message)
}
  

  }

  module.exports.postloginController = async function(req,res){
    let {email,password} = req.body;
    // console.log(req.body);
    
    let user = await userModel.findOne({email});
    if(!user)return res.send("youd don't have account");

    let result = await bcrypt.compare(password,user.password)
      
    if(result){
      
        let token = jwt.sign({email: user.email, id:user._id},process.env.JWT_KEY)
        res.cookie("token",token);
        res.redirect("/dashboard")
      }
      else{
        res.send("Something went wrong")
      }
    

  }

  module.exports.logoutController = async function(req,res){
    res.cookie("token","");
    return res.redirect("/")
  }

  module.exports.dashboardPageController = async function(req, res) {
    try {

      let user=  await req.user.populate("friendRequests sentRequests");
      
      
      // Get page and limit from query params, with default values
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 5; // Default to 5 posts per page
  
      // Calculate the number of posts to skip
      const skip = (page - 1) * limit;
  
      // Fetch paginated posts
      const allPosts = await postModel.find()
        .sort({ createdAt: -1 }) // Sort by createdAt, newest first
        .skip(skip)
        .limit(limit)
        .populate('user')
  
      // Get total count of posts for pagination calculations
      const totalPosts = await postModel.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
  
      // Render the dashboard with paginated posts and pagination data
      res.render('dashboard', {
        user: user,
        posts: allPosts, // Pass the paginated posts
        currentPage: page,
        totalPages: totalPages
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while loading the dashboard.');
    }
  };

  // for searching users
  module.exports.allUsersController = async function(req,res){
   
    try{
        const { query} =req.query;
        
        if (!query) {
            return res.json([]);
        }

        const regex = new RegExp(`^${query}`, 'i');

        const users = await userModel.find({
            $or: [
                { name: { $regex: regex } },
                { username: { $regex: regex } },
            ]
        });

        res.json(users);

    } catch(error){
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
        
    }
    
  }

  module.exports.userProfileController = async function(req,res){
    const user = await userModel.findOne({username:req.params.username}).populate('posts');
    console.log(req.user._id);
    console.log(user._id);

      
    
    res.render("profile",{user,logedInUser:req.user})
  }

  module.exports.postCreatePostController = async function(req,res){
      
      
      const post = await postModel.create({
        caption: req.body.caption,
        img: req.file ? `${req.file.filename}` : '',
        user: req.user._id
      })

      await userModel.findByIdAndUpdate(req.user._id, {
        $push: { posts: post._id } // Add the new post's ID to the user's 'posts' array
      });

      
      
      res.redirect("/dashboard")
      

  }

  module.exports.sendRequestController = async (req, res) => {

    
   
    try {
        const senderId = req.user._id; // The user sending the request (authenticated)
        const receiverId = req.params.id; // The user receiving the request

        // Add sender to receiver's friendRequests
        const receiver = await userModel.findById(receiverId);
        if (!receiver.friendRequests.includes(senderId)) {
            receiver.friendRequests.push(senderId);
            await receiver.save();
        }

        // Add receiver to sender's sentRequests
        const sender = await userModel.findById(senderId);
        if (!sender.sentRequests.includes(receiverId)) {
            sender.sentRequests.push(receiverId);
            await sender.save();
        }

        res.status(200).json({ message: 'Friend request sent.' });
    } catch (err) {
        res.status(500).json({ error: 'Error sending friend request.' });
    }

}

module.exports.acceptRequestController = async (req, res) => {
 
  try {
      const userId = req.user._id; // The user accepting the request
      const senderId = req.params.id; // The user who sent the request

      const user = await userModel.findById(userId);
      const sender = await userModel.findById(senderId);

      // Check if the request exists
      if (!user.friendRequests.includes(senderId)) {
          return res.status(400).json({ error: 'No friend request from this user.' });
      }

      // Add each other as friends
      user.friends.push(senderId);
      sender.friends.push(userId);
      console.log(sender.name," ",sender.sentRequests);
      console.log(user.name," ",user.friendRequests);

      

      // Remove the request
      user.friendRequests = user.friendRequests.filter(id => !id.equals(senderId)); // Use equals() for ObjectId comparison
    sender.sentRequests = sender.sentRequests.filter(id => !id.equals(userId)); // Use equals() for ObjectId comparison

      console.log(sender.name," ",sender.sentRequests);
      console.log(user.name," ",user.friendRequests);



      await user.save();
      await sender.save();

      res.status(200).json({ message: 'Friend request accepted.' });
  } catch (err) {
      res.status(500).json({ error: 'Error accepting friend request.' });
  }
}

module.exports.rejectRequestController = async (req, res) => {
  try {
    const userId = req.user._id; // The user rejecting the request
    const senderId = req.params.id; // The user who sent the request

    // Find both the user rejecting the request and the sender
    const user = await userModel.findById(userId);
    const sender = await userModel.findById(senderId);

    // Check if the friend request exists
    if (!user.friendRequests.includes(senderId)) {
      return res.status(400).json({ error: 'No friend request from this user.' });
    }

    // Remove the friend request and sent request
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== userId);

    // Save the updates for both users
    await user.save();
    await sender.save();

    res.status(200).json({ message: 'Friend request rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Error rejecting friend request.' });
  }
};


module.exports.messageBoxController= async (req,res)=>{
  let user=  await req.user.populate("friendRequests sentRequests friends");

     res.render('chat',{user})
}
  
module.exports.saveChatPageController = async function(req,res){
  try {
    var chat = await chatModel.create({
        sender_Id: req.body.sender_Id,
        receiver_Id: req.body.receiver_Id,
        message: req.body.message
    });
    await chat.save();
    res.status(200).send({ success: true, msg: 'Chat inserted successfully', data: chat });
} catch (err) {
    res.send(err.message);
}

}
