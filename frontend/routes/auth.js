// www/routes/auth.js
const Auth = {
    login: (username, password) => {
        console.log(`Login called for ${username}`);
        // यहां API call कर सकते हैं
    },
    logout: () => {
        console.log("Logout called");
        localStorage.removeItem("token");
    }
};