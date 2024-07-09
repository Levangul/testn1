const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001; 
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
});


const startApolloServer = async () => {
    await server.start(); 

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());


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
