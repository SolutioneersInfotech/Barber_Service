const Conversation = require("../models/conversation.js");
const Message = require("../models/message.js");
const { app, io, server, getReceiverSocketId } = require('../socket.js');
const { sendGeneralResponse } = require('../utils/responseHelper');


const sendMessage = async (req, res) => {
	try {
		const { message , senderId} = req.body;
		const { id: receiverId } = req.params;
		// const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

	//	res.status(201).json(newMessage);
        sendGeneralResponse(res, true, 'New message', 201, newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		
        sendGeneralResponse(res, false, 'Error in getMessages', 500, error.message);
	}
};

// Get Messages Controller
const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const { senderId } = req.body;

        // Find conversation between sender and receiver
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        })
            .populate({
                path: "messages",
                populate: {
                    path: "senderId receiverId",
                    select: "firstName",  // Populate sender and receiver with their first names
                },
            })
            .populate({
                path: "participants",
                select: "firstName",  // Populate participants to get their first names
            })
            .exec();

        // If no conversation is found, return an empty array
        if (!conversation) return sendGeneralResponse(res, true, 'No messages found', 200, []);

        // Format the messages to include sender and receiver names
        const messagesWithNames = conversation.messages.map(message => ({
            _id: message._id,
            message: message.message,
            sender: message.senderId ? message.senderId.firstName : "Unknown",  // Sender's firstName
            receiver: message.receiverId ? message.receiverId.firstName : "Unknown",  // Receiver's firstName
            createdAt: message.createdAt,
        }));

        // Send the conversation and messages in the response
        sendGeneralResponse(res, true, 'Messages retrieved', 200, {
            conversation: conversation.participants,
            messages: messagesWithNames,
        });
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        sendGeneralResponse(res, false, 'Error in getMessages', 500, error.message);
    }
};

module.exports = {
    getMessages,sendMessage
};
