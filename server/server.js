require('dotenv').config();
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
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const app = express();

// Configure body parser to handle large payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// CORS options
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Create HTTP server
const httpServer = http.createServer(app);

// Configure Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', ({ userId }) => {
    console.log('User joined:', userId);
    socket.join(userId);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    console.log('Message received to send:', { senderId, receiverId, message });
    try {
      if (!receiverId) {
        console.error('Error: receiverId is undefined');
        return;
      }

      const chatMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        message: message,
      });
      await chatMessage.save();

      const responseMessage = {
        senderId,
        receiverId,
        message,
        timestamp: chatMessage.timestamp,
      };

      console.log('Message saved, emitting to receiver and sender:', responseMessage);

      io.to(receiverId).emit('receiveMessage', responseMessage);
      io.to(senderId).emit('receiveMessage', responseMessage);
    } catch (error) {
      console.error('Error in sendMessage event:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Configure Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authMiddleware({ req }),
});

const startApolloServer = async () => {
  try {
    await apolloServer.start();

    app.use(
      "/graphql",
      expressMiddleware(apolloServer, {
        context: ({ req }) => authMiddleware({ req }),
      })
    );

    // Configure multer for file uploads
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    app.post('/upload', upload.single('file'), async (req, res) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).send({ message: 'Please upload a file.' });
        }

        const user = await User.findOne({ email: req.body.email });
        if (user) {
          user.profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
          await user.save();
        } else {
          return res.status(404).send({ message: 'User not found.' });
        }

        res.send({ message: 'Profile image uploaded successfully.', profilePicture: user.profilePicture });
      } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send({ message: 'Failed to upload file.', error });
      }
    });

    // Configure session
    app.use(session({
      secret: process.env.SESSION_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 15, // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 60 * 15, // 15 minutes
      }),
    }));

    // Serve static assets in production
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
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }
};

startApolloServer();
