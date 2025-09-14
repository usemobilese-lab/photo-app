// www/routes/posts.js
const Posts = {
    getAll: () => {
        console.log("Fetching posts");
        return [];
    },
    create: (content) => {
        console.log(`Creating post: ${content}`);
    }
};