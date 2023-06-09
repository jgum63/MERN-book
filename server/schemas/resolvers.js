const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    getSingleUser: async (parent, {id, user}, context) => {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });
  
      if (!foundUser) {
        throw new Error('No user found')
      }
  
      return foundUser;
    },
    login: async (parent, {username, email}, context) => {
      const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
      if (!user) {
        return res.status(400).json({ message: "Can't find this user" });
      }
  
      const correctPw = await user.isCorrectPassword(body.password);
  
      if (!correctPw) {
        return res.status(400).json({ message: 'Wrong password!' });
      }
      const token = signToken(user);
      return {token, user};
    },
  },

  Mutation: {
    createUser: async (parent, args, context) => {
      const user = await User.create(args);
  
      if (!user) {
        return res.status(400).json({ message: 'Something is wrong!' });
      }
      const token = signToken(user);
      res.json({ token, user });
    },
    saveBook: async (parent, {id, user}, context) => {
      console.log(user);
      try {
        if(context.user){
          const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { savedBooks: body } },
            { new: true, runValidators: true }
          );
        } else {
          throw new Error('Not logged in!')
        }
        return updatedUser
      } catch (err) {
        console.log(err);
        return res.status(400).json(err);
      }
    },
    deleteBook: async (parent, args, context) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "Couldn't find user with this id!" });
      }
      return updatedUser;
    },
  }
};

module.exports = resolvers;
