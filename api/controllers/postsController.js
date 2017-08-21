const mongoose = require('mongoose');

const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

const STATUS_USER_ERROR = 422;

const createPost = (req, res) => {
    const { title, text } = req.query;
    const newPost = new Post({ title, text });
    newPost.save()
        .then((newPost) => {
            res.json(newPost);
        })
        .catch((err) => {
            res.status(STATUS_USER_ERROR);
            res.json(err);
        });
};

const listPosts = (req, res) => {
    Post.find({}).exec()
        .then((posts) => {
            posts.populate('comments').exec()
                .then((p) => {
                    res.send(p);
                })
                .catch((err) => {
                    res.status(STATUS_USER_ERROR);
                    res.json(err);
                });
        })
        .catch((err) => {
            res.status(STATUS_USER_ERROR);
            res.json(err);
        });
};

const findPost = (req, res) => {
    const { id } = req.params;
    Post.findById(id).exec()
        .then((post) => {
            post.populate('comments').exec()
                .then((p) => {
                    res.send(p);
                })
                .catch((err) => {
                    res.status(STATUS_USER_ERROR);
                    res.json(err);
                });
        })
        .catch((err) => {
            res.status(STATUS_USER_ERROR);
            res.json(err);
        });
};

const addComment = (req, res) => {
    const { id } = req.params;
    const { text } = req.query;

    const newComment = new Comment({ _parent: id, text });
    newComment.save()
        .then((comment) => {
            Post.findById(id).exec()
                .then((post) => {
                    post.comments.push(comment);
                    post.save();
                    res.send({ success: true });
                })
                .catch((err) => {
                res.status(STATUS_USER_ERROR);
                res.json(err);
            });
        })
        .catch((err) => {
            res.status(STATUS_USER_ERROR);
            res.json(err);
        });

    
};

const deleteComment = (req, res) => {
    const { id, commentId } = req.params;

    Comment.findByIdAndRemove(commentId).exec()
       .catch((err) => {
           res.status(STATUS_USER_ERROR);
           res.json(err);
       });

    Post.findById(id).exec()
        .then((post) => {
            const index = post.comments.findIndex((c) => {
                c._id === comment._id;
            });
            post.comments.split(index, 1);
            res.json({ success: true });
        })
        .catch((err) => {
            res.status(STATUS_USER_ERROR);
            res.json(err);
        });
};

const deletePost = (req, res) => {
    const { id } = req.params;
    
    const comments = Post.findByIdAndRemove(id).exec()
        .then((post) => {
            return Promise.resolve(post.comments);
        })
        .catch((err) => {
            res.status(STATUS_USER_ERROR);
            res.json(err);
        });

   Comment.remove({
       '_id': { $in: comments }
   }).exec()
    .then(() => {
        res.send({ success: true });
    })
    .catch((err) => {
        res.status(STATUS_USER_ERROR);
        res.json(err);
    });
};

module.exports = {
    createPost,
    listPosts,
    findPost,
    addComment,
    deleteComment,
    deletePost
};

