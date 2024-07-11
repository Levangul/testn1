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

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const startApolloServer = async () => {
    await server.start();

    // Enable CORS
    app.use(cors({
        origin: "http://localhost:3000", // Adjust this to your client's origin
        credentials: true
    }));

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Adjust the upload directory to the client folder
    const uploadDir = path.join(__dirname, '../client/uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    // Configure Multer storage
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });

    const upload = multer({ storage });

    // Add the upload endpoint
    app.post('/upload', upload.single('file'), (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send({ message: 'Please upload a file.' });
            }
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            res.send({ url: fileUrl });
        } catch (error) {
            console.error('Error uploading file:', error); // Log the error
            res.status(500).send({ message: 'Failed to upload file.', error });
        }
    });

    // Serve the uploaded files from the client directory
    app.use('/uploads', express.static(uploadDir));

    app.use(
        "/graphql",
        expressMiddleware(server, {
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
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database',
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
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}`);
            console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
        });
    });
};

startApolloServer();
