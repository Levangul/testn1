const resolvers = {
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            try {
                const user = await User.create({ username, email, password });
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                if (err.code === 11000) {
                    if (err.keyValue.username) {
                        throw new AuthenticationError(
                            "Username already exists. Please choose another one."
                        );
                    }
                    if (err.keyValue.email) {
                        throw new AuthenticationError(
                            "Email already exists. Please choose another one."
                        );
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
    }
}