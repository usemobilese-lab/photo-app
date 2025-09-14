document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value;
    if(!query) {
      searchResults.innerHTML = "";
      return;
    }
    const res = await fetch(`/search-users?name=${query}`);
    const users = await res.json();
    searchResults.innerHTML = "";
    users.forEach(user => {
      const div = document.createElement("div");
      div.className = "user-result";
      div.innerHTML = `
        <a href="/user-feed.html?userId=${user._id}">${user.name}</a>
      `;
      searchResults.appendChild(div);
    });
  });
});