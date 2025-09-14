const posts = [
    { id: 1, title: "Hello World", content: "This is the first post." },
    { id: 2, title: "Second Post", content: "Cordova app is running!" }
];

function showPosts() {
    const container = document.createElement("div");
    posts.forEach(post => {
        const postEl = document.createElement("div");
        postEl.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p>`;
        container.appendChild(postEl);
    });
    document.body.appendChild(container);
}

window.addEventListener("load", showPosts);