const express = require('express');

const { landingPageController, postregisterController, postloginController, logoutController, dashboardPageController, allUsersController, userProfileController, postCreatePostController, sendRequestController, acceptRequestController, rejectRequestController, messageBoxController, saveChatPageController } = require('../controllers/index-Controller');

const { isLoggedIn } = require('../middlewares/auth-middleware');
const route = express.Router();
const upload = require('../config/multer')

route.get("/",landingPageController)
route.post("/register",postregisterController)
route.get("/dashboard",isLoggedIn,dashboardPageController)
route.post("/login",postloginController)
route.get("/logout",logoutController)
route.get("/allUsers/search",allUsersController)
route.get("/profile/:username",isLoggedIn, userProfileController)
route.post("/postCreate/:id",upload.single('image'),isLoggedIn,postCreatePostController)
route.get('/send-request/:id',isLoggedIn,sendRequestController);
route.get('/accept-request/:id',isLoggedIn,acceptRequestController);
route.get('/reject-request/:id',isLoggedIn,rejectRequestController);
route.get('/messageBox/:id',isLoggedIn,messageBoxController)
route.post("/saveChat",saveChatPageController)






module.exports=route;