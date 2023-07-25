const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userDate = await User.findOne({ _id: context.user._id})
                .select('-__v -password')
                .populate('savedBooks');

                return userData;
            }

            throw new AuthenticationError('User Not Logged In.');
        },
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('No User found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Password');
            }

            const token = signToken(user);

            return { token, user };
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async ( parent, { bookToSave }, context) => {
            if (context.user) {
                const updatedBooks = await User.fineOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookToSave }},
                    { new: true}
                ).populate('savedBooks');

                return updatedBooks;
            }
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedBooks = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    {$pull: { savedBooks: { bookId }}},
                    {new: true},
                );

                return updatedBooks;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers