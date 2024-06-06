const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001; // Define the port to run the server
const app = express();

const server = new ApolloServer({
    typeDefs,
    resolvers,
});


const startApolloServer = async () => {
    await server.start();

    // Middleware to parse URL-encoded and JSON bodies
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Middleware to handle GraphQL requests
    app.use(
        "/graphql",
        expressMiddleware(server, {
            context: ({ req }) => authMiddleware({ req }),
        })
    );

    // Serve static assets in production
    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, "../client/dist")));
        app.get("*", (req, res) => {
            res.sendFile(path.join(__dirname, "../client/dist/index.html"));
        });
    }
    // Connect to the database and start the server
    db.once("open", () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
            console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
        });
    });
};

// Start the Apollo server
startApolloServer();
