const { AuthenticationError } = require('apollo-server-express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        users: async () => await User.find({}),
        user: async (_, { username }) => await User.findOne({ username }),
        posts: async () => await Post.find({}),
        post: async (_, { id }) => await Post.findById(id),
        comments: async (_, { postId }) => await Comment.find({ post: postId }),
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                if (err.code === 11000) {
                    if (err.keyValue.username) {
                        throw new AuthenticationError("Username already exists. Please choose another one.");
                    }
                    if (err.keyValue.email) {
                        throw new AuthenticationError("Email already exists. Please choose another one.");
                    }
                }
                throw new AuthenticationError("Something went wrong");
            }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("User not found");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect password");
            }

            const token = signToken(user);

            return { token, user };
        },
        addPost: async (_, { text }, { user }) => {
            if (!user) throw new AuthenticationError('You must be logged in to create a post');
            const newPost = new Post({
                text,
                author: user._id,
                date: new Date().toISOString()
            });
            await newPost.save();
            user.posts.push(newPost);
            await user.save();
            return newPost;
        },
        addComment: async (_, { postId, text }, { user }) => {
            if (!user) throw new AuthenticationError('You must be logged in to comment');
            const post = await Post.findById(postId);
            if (!post) throw new Error('Post not found');
            const newComment = new Comment({
                text,
                author: user._id,
                post: postId,
                date: new Date().toISOString()
            });
            await newComment.save();
            post.comments.push(newComment);
            await post.save();
            return newComment;
        }
    },
    User: {
        posts: async (user) => await Post.find({ author: user._id })
    },
    Post: {
        author: async (post) => await User.findById(post.author),
        comments: async (post) => await Comment.find({ post: post._id })
    },
    Comment: {
        author: async (comment) => await User.findById(comment.author),
        post: async (comment) => await Post.findById(comment.post)
    }
};

module.exports = resolvers;