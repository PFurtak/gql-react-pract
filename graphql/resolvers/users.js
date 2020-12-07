const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../util/validators');
const { JWT_SECRET_KEY } = require('../../config');
const User = require('../../models/User');

function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('Invalid credentials', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Invalid credentials';
        throw new UserInputError('Invalid credentials', { errors });
      }

      const token = generateJWT(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // Make sure user doesn't already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('This username already exists', {
          errors: {
            username: 'This username is taken',
          },
        });
      }

      // Hash password and create auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateJWT(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
