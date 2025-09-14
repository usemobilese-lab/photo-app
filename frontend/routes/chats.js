// www/routes/chats.js
const Chats = {
    getAll: () => {
        console.log("Fetching all chats");
        // API call simulation
        return [];
    },
    sendMessage: (chatId, message) => {
        console.log(`Send message to ${chatId}: ${message}`);
    }
};