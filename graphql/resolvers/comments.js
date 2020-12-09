const { UserInputError, AuthenticationError } = require('apollo-server');

const Post = require('../../models/Post');
const verifyAuth = require('../../util/verifyAuth');

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = verifyAuth(context);
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body cannot be empty',
          },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = verifyAuth(context);
      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError('User does not own comment');
        }
      } else {
        throw new UserInputError('Post not found');
      }
    },
    likePost: async (_, { postId }, context) => {
      const { username } = verifyAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // If post is already liked, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // If post is not liked, like it
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else throw new UserInputError('Post not found');
    },
  },
};
