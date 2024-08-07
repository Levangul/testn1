const { User, Post, Comment, Message } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => await User.find({}),
    user: async (_, { name, lastname }) => await User.findOne({ name, lastname }),
    userById: async (_, { id }) => await User.findById(id),
    posts: async () => await Post.find({}).sort({ date: -1 }),
    post: async (_, { id }) => await Post.findById(id),
    comments: async (_, { postId }) => await Comment.find({ post: postId }),
    searchUser: async (_, { name, lastname }) => {
      const users = await User.find({
        name: { $regex: name, $options: 'i' },
        lastname: { $regex: lastname, $options: 'i' },
      });
      return users;
    },
    messages: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to view messages');

      return await Message.find({
        $or: [
          { sender: user._id },
          { receiver: user._id }
        ]
      }).populate('sender receiver');
    },
  },
  Mutation: {
    addUser: async (parent, { name, lastname, email, password }) => {
      try {
        const user = await User.create({ name, lastname, email, password });
        const token = signToken({ email: user.email, name: user.name, lastname: user.lastname, _id: user._id.toString() });
        return { token, user };
      } catch (err) {
        if (err.code === 11000) {
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

      const token = signToken({ email: user.email, name: user.name, lastname: user.lastname, _id: user._id.toString() });

      return { token, user };
    },
    addPost: async (_, { text }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to create a post');

      const newPost = new Post({
        text,
        author: user._id,
        date: new Date().toISOString(),
      });

      await newPost.save();

      const dbUser = await User.findById(user._id);
      dbUser.posts.push(newPost._id);
      await dbUser.save();

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

      post.comments.push(newComment._id);
      await post.save();

      return newComment;
    },
    removePost: async (parent, { postId }, context) => {
      if (context.user) {
        const post = await Post.findById(postId);
        if (post && post.author.toString() === context.user._id.toString()) {
          await Comment.deleteMany({ post: postId });
          await Post.findByIdAndDelete(postId);
          return post;
        }
        throw new AuthenticationError('You do not have permission to delete this post.');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    updateUserInfo: async (_, { city, birthday, aboutMe, profilePicture }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to update your profile');

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { city, birthday, aboutMe, profilePicture },
        { new: true }
      );

      return updatedUser;
    },
    markMessagesAsRead: async (_, { receiverId }, { user }) => {
      if (!user) throw new AuthenticationError("You must be logged in");

      try {
        await Message.updateMany(
          { sender: receiverId, receiver: user._id, read: false },
          { $set: { read: true } }
        );
        return true;
      } catch (error) {
        console.error("Error marking messages as read:", error);
        return false;
      }
    },
    removeComment: async (parent, { commentId }, context) => {
      if (context.user) {
        const comment = await Comment.findById(commentId);
        if (comment && comment.author.toString() === context.user._id.toString()) {
          await Comment.findByIdAndDelete(commentId);
          return comment;
        }
        throw new AuthenticationError('You do not have permission to delete this comment.');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    sendFriendRequest: async (_, { friendId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to send a friend request');

      const friend = await User.findById(friendId);
      if (!friend) throw new Error('User not found');

      if (friend.friendRequests.includes(user._id.toString())) {
        throw new Error('Friend request already sent');
      }

      friend.friendRequests.push(user._id.toString());
      await friend.save();

      return friend;
    },
    acceptFriendRequest: async (_, { friendId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to accept a friend request');
      
      const currentUser = await User.findById(user._id);
      
      // Log the relevant data
      console.log("Friend Requests in DB:", currentUser.friendRequests);
      console.log("friendId being accepted:", friendId);
      
      if (!currentUser.friendRequests.map(id => id.toString()).includes(friendId.toString())) {
          console.error("Friend request not found in user's friendRequests array");
          throw new Error('No friend request found');
      }
  
      // Process the friend request
      currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== friendId.toString());
      currentUser.friends.push(friendId.toString());
  
      const friend = await User.findById(friendId);
      if (friend) {
          friend.friends.push(currentUser._id.toString());
          await friend.save();
      }
  
      await currentUser.save();
  
      return friend;
  },
    
  rejectFriendRequest: async (_, { friendId }, { user }) => {
    if (!user) throw new AuthenticationError('You must be logged in to reject a friend request');
  
    // Fetch the full user data from the database
    const currentUser = await User.findById(user._id);
  
    // Log the relevant data
    console.log("Friend Requests in DB:", currentUser.friendRequests);
    console.log("friendId being rejected:", friendId);
  
    // Ensure that the friend request exists
    if (!currentUser.friendRequests.map(id => id.toString()).includes(friendId.toString())) {
      console.error("Friend request not found in user's friendRequests array");
      throw new Error('No friend request found');
    }
  
    // Remove the friend request
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== friendId.toString());
    await currentUser.save();
  
    console.log('Friend request rejected successfully. Updated friendRequests:', currentUser.friendRequests);
    return true;
  },
    
  },
  User: {
    posts: async (user) => await Post.find({ author: user._id }).sort({ date: -1 }),
    friends: async (user) => await User.find({ _id: { $in: user.friends.map(id => id.toString()) } }),
    friendRequests: async (user) => await User.find({ _id: { $in: user.friendRequests.map(id => id.toString()) } }),
  },
  Post: {
    author: async (post) => await User.findById(post.author.toString()),
    comments: async (post) => await Comment.find({ post: post._id.toString() }).sort({ date: -1 })
  },
  Comment: {
    author: async (comment) => await User.findById(comment.author.toString()),
    post: async (comment) => await Post.findById(comment.post.toString())
  },
};

module.exports = resolvers;
