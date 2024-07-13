const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const multer = require("multer");
const cors = require("cors");
const fs = require('fs');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

// Create an HTTP server
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Define the message schema
// const messageSchema = new mongoose.Schema({
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     message: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now },
// });

// const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join', ({ userId }) => {
        socket.join(userId);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
        const chatMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message: message,
        });
        await chatMessage.save();

        io.to(receiverId).emit('receiveMessage', {
            senderId,
            message,
            timestamp: chatMessage.timestamp,
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const startApolloServer = async () => {
    await apolloServer.start();

    // Enable CORS
    app.use(cors({
        origin: "http://localhost:3000", // Adjust this to your client's origin
        credentials: true
    }));

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Use memory storage for Multer
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    // Define Profile schema with image storage
    const profileSchema = new mongoose.Schema({
        username: String,
        email: String,
        profileImage: Buffer,
        profileImageType: String,
    });

    const Profile = mongoose.model('Profile', profileSchema);

    app.post('/upload', upload.single('file'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send({ message: 'Please upload a file.' });
            }
    
            const profile = await Profile.findOne({ email: req.body.email });
            if (profile) {
                profile.profileImage = file.buffer;
                profile.profileImageType = file.mimetype;
                await profile.save();
            } else {
                const newProfile = new Profile({
                    username: req.body.username,
                    email: req.body.email,
                    profileImage: file.buffer,
                    profileImageType: file.mimetype,
                });
                await newProfile.save();
            }
    
            res.send({ message: 'Profile image uploaded successfully.', url: `http://localhost:3001/profile/${req.body.email}` });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).send({ message: 'Failed to upload file.', error });
        }
    });
    

    app.get('/profile/:email', async (req, res) => {
        try {
            const profile = await Profile.findOne({ email: req.params.email });
            if (!profile || !profile.profileImage) {
                return res.status(404).send({ message: 'Profile not found or image not uploaded.' });
            }

            res.set('Content-Type', profile.profileImageType);
            res.send(profile.profileImage);
        } catch (error) {
            console.error('Error retrieving profile image:', error);
            res.status(500).send({ message: 'Failed to retrieve profile image.', error });
        }
    });

    app.use(
        "/graphql",
        expressMiddleware(apolloServer, {
            context: ({ req }) => authMiddleware({ req }),
        })
    );

    app.use(session({
        secret: process.env.SESSION_SECRET || 'your_secret_key',
        cookie: {
            maxAge: 1000 * 60 * 15, // 15 minutes
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        },
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/testN1',
            ttl: 60 * 15, // 15 minutes
        }),
    }));

    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, "../client/dist")));
        app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "../client/dist/index.html"));
        });
    }

    db.once("open", () => {
        httpServer.listen(PORT, () => {
            console.log(`API server running on port ${PORT}`);
            console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
        });
    });
};

startApolloServer();
