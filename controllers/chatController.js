const Chat = require('../models/chat');
const Dump = require('../models/dump');
const User = require('../models/user');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');



exports.getChat = catchAsyncErrors(async(req,res,next) => {
	const chat = await Chat.findById(req.params.id);

	res.status(200).json({
	 	success: true,
	 	chat
	})

})


exports.newChat = catchAsyncErrors(async(req,res,next) => {
	
    let chats = [];

    chats.push({
        room: req.body.room,
        author: req.user.id,
        message: req.body.message,
        time:  new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
    })

	const chat = await Chat.create({
		room: req.body.room,
        chats
    })
	

	res.status(201).json({
		success:true,
		chat 
	})

})


exports.updateChat = catchAsyncErrors(async(req,res,next) => {
	
	const chat = await Chat.findById(req.params.id);


	let current_chats = [...chat.chats, {
        room: chat.room,
        author: req.user.id,
        message: req.body.message,
        time:  req.body.time
    }]

    chat.chats = current_chats

	await chat.save();

	const updatedChat = await Chat.findById(req.params.id).populate('chats.author');

	const NotifTitle = `New Message From ${req.user.first_name}: ${req.body.message}`


	if(req.body.chatCategory == "donation"){

		const bulk = await User.find( { _id: req.body.receiver } ).updateMany( { $push: { notifications: {
				room:'basurahunt-notification-3DEA5E28CE9B6E926F52AF75AC5F7-94687284AF4DF8664C573E773CF31', 
				title:NotifTitle, 
				sender_id:req.user.id, 
				receiver_id:req.body.receiver,
				time:new Date(Date.now()),
				barangay:req.user.barangay, 
				link:req.body.link,
				notifCode:req.body.notifCode, 
				status:'unread',
				category:'donation-new-message'} } }  );


	}else{	
		if(req.user.role == "user"){
			const bulk = await User.find( { role: "administrator" } ).updateMany( { $push: { notifications: {
				room:'basurahunt-notification-3DEA5E28CE9B6E926F52AF75AC5F7-94687284AF4DF8664C573E773CF31', 
				title:NotifTitle, 
				sender_id:req.user.id, 
				receiver_id:null,
				time:new Date(Date.now()),
				barangay:req.user.barangay, 
				link:req.body.link,
				notifCode:req.body.notifCode, 
				status:'unread',
				category:'illegalDump-new-message'} } }  );
		}
		if(req.user.role == "administrator"){
			const bulk = await User.find( { _id: req.body.receiver } ).updateMany( { $push: { notifications: {
				room:'basurahunt-notification-3DEA5E28CE9B6E926F52AF75AC5F7-94687284AF4DF8664C573E773CF31', 
				title:NotifTitle, 
				sender_id:req.user.id, 
				receiver_id:req.body.receiver,
				time:new Date(Date.now()),
				barangay:req.user.barangay, 
				link:req.body.link,
				notifCode:req.body.notifCode, 
				status:'unread',
				category:'illegalDump-new-message'} } }  );
		}
	}


	
	// console.log("great", req.user.role)

	res.status(201).json({
		success:true,
		chat:updatedChat
	})

})
