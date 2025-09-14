// www/routes/users.js
const Users = {
    getProfile: (userId) => {
        console.log(`Fetching profile for user ${userId}`);
        return { id: userId, name: "Demo User" };
    }
};