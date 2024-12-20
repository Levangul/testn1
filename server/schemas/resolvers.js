const { User, Post, Comment, Message, Reply} = require('../models');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const mongoose = require('mongoose');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => await User.find({}),
    user: async (_, { name, lastname }) => await User.findOne({ name, lastname }),
    userById: async (_, { id }) => await User.findById(id),
    posts: async () => await Post.find({}).sort({ date: -1 }),
    post: async (_, { id }) => await Post.findById(id),
    comments: async (_, { postId }) => await Comment.find({ post: postId }),
    replies: async (_, { commentId }) => await Reply.find({ comment: commentId }),
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
    addReply: async (_, { commentId, text }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to add a reply');
    
      // Ensure commentId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new UserInputError('Invalid comment ID');
      }
    
      // Find the comment to which the reply is being added
      const comment = await Comment.findById(commentId);
      if (!comment) throw new UserInputError('Comment not found');
    
      // Create the new reply
      const newReply = new Reply({
        text,
        author: user._id,
        comment: commentId,
        date: new Date().toISOString(),
      });
    
      // Save the new reply
      await newReply.save();
    
      // Push the new reply's ID into the comment's replies array and save the comment
      comment.replies.push(newReply._id);
      await comment.save();
    
      // Return the newly created reply (without populating it)
      return newReply;
    },
    
    

 removeReply: async (_, { replyId }, { user }) => {
  if (!user) throw new AuthenticationError('You must be logged in to delete a reply');

  const reply = await Reply.findById(replyId);
  if (!reply) throw new UserInputError('Reply not found');
  if (!reply.author.equals(user._id)) {
    throw new AuthenticationError('You do not have permission to delete this reply');
  }

  // Use findByIdAndDelete to remove the reply directly
  await Reply.findByIdAndDelete(replyId);

  return reply;
},
    removePost: async (parent, { postId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
    
      const post = await Post.findById(postId);
      
      if (!post) {
        throw new UserInputError('Post not found.');
      }
    
      if (post.author.toString() !== context.user._id.toString()) {
        throw new AuthenticationError('You do not have permission to delete this post.');
      }
    
      await Comment.deleteMany({ post: postId });
      await Post.findByIdAndDelete(postId);
    
      return post;
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

    toggleGhostMode: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to toggle Ghost Mode');

      // Fetch the user and toggle the GhostMode field
      const currentUser = await User.findById(user._id);
      currentUser.GhostMode = !currentUser.GhostMode; // Toggle the Ghost Mode status
      await currentUser.save(); // Save the updated user

      return currentUser; // Return the updated user object
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
  

    const currentUser = await User.findById(user._id);
  
 
    if (!currentUser.friendRequests.map(id => id.toString()).includes(friendId.toString())) {
      console.error("Friend request not found in user's friendRequests array");
      throw new Error('No friend request found');
    }
  

    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== friendId.toString());
    await currentUser.save();
  
    console.log('Friend request rejected successfully. Updated friendRequests:', currentUser.friendRequests);
    return true;
  },
  removeFriend: async (_, { friendId }, { user }) => {
    if (!user) throw new AuthenticationError('You must be logged in to remove friends');
  
    const currentUser = await User.findById(user._id);
    const friend = await User.findById(friendId);
  
    if (!friend) throw new Error('Friend not found');
  

    currentUser.friends = currentUser.friends.filter(id => id.toString() !== friendId.toString());
  

    friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());
  
    await currentUser.save();
    await friend.save();
  
    return friend;
  },
    
  },
  User: {
    posts: async (user) => await Post.find({ author: user._id }).sort({ date: -1 }),
    friends: async (user) => await User.find({ _id: { $in: user.friends.map(id => id.toString()) } }),
    friendRequests: async (user) => await User.find({ _id: { $in: user.friendRequests.map(id => id.toString()) } }),
  },
  Post: {
    author: async (post) => await User.findById(post.author.toString()),
    comments: async (post) => await Comment.find({ post: post._id.toString() })
  },
  Comment: {
    author: async (comment) => await User.findById(comment.author.toString()),
    post: async (comment) => await Post.findById(comment.post.toString()),
    replies: async (comment) => await Reply.find({ comment: comment._id.toString() })
  },
  Reply: {
    author: async (reply) => await User.findById(reply.author.toString()),
  },
  
};

module.exports = resolvers;
