const API_BASE = "http://192.168.18.189:8080"; // ⚠️ यहाँ अपनी IP डालें
const TOKEN = localStorage.getItem('token');
const USER = JSON.parse(localStorage.getItem('user') || 'null');

if(!TOKEN || !USER){
  window.location.href = 'index.html';
}

document.getElementById('welcome').innerText = `Hi, ${USER.name}`;
document.getElementById('sidePic').src = USER.profilePic || 'images/placeholder.png';
document.getElementById('profileAvatar').src = USER.profilePic || 'images/placeholder.png';
document.getElementById('sideName').innerText = USER.name;
document.getElementById('sideBio').innerText = USER.bio || '';

document.getElementById('logoutBtn').addEventListener('click', ()=>{
  localStorage.removeItem('token'); localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Post create
document.getElementById('postForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const caption = document.getElementById('caption').value.trim();
  const file = document.getElementById('media').files[0];

  const fd = new FormData();
  fd.append('caption', caption);
  if(file) fd.append('media', file);

  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN },
      body: fd
    });
    if(!res.ok){
      const err = await res.json(); throw new Error(err.msg || 'Post failed');
    }
    document.getElementById('caption').value=''; document.getElementById('media').value='';
    loadPosts();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

// Load posts
async function loadPosts(){
  try {
    const res = await fetch(`${API_BASE}/api/posts`, {
      headers: { 'Authorization': 'Bearer ' + TOKEN }
    });
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    console.error(err);
  }
}

function renderPosts(posts){
  const container = document.getElementById('postsList');
  container.innerHTML = '';
  posts.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    const isOwner = p.userEmail === USER.email;
    const likes = p.likes ? p.likes.length : 0;
    const comments = p.comments ? p.comments.length : 0;

    const header = document.createElement('div'); header.className='header';
    header.innerHTML = `
      <div class="user">
        <img class="avatar" src="${p.profilePic || 'images/placeholder.png'}">
        <div>
          <div style="font-weight:700">${p.userName}</div>
          <div class="small">${new Date(p.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <div>${isOwner ? `<button data-id="${p._id}" class="delBtn">Delete</button>` : ''}</div>
    `;
    card.appendChild(header);

    if(p.caption) {
      const cap = document.createElement('div'); cap.textContent = p.caption; cap.style.marginTop='8px';
      card.appendChild(cap);
    }

    if(p.media && p.mediaType === 'image') {
      const img = document.createElement('img'); img.className='media'; img.src = `${API_BASE}${p.media}`; card.appendChild(img);
    } else if(p.media && p.mediaType === 'video') {
      const v = document.createElement('video'); v.controls=true; v.src = `${API_BASE}${p.media}`; card.appendChild(v);
    }

    const actions = document.createElement('div'); actions.className='actions';
    actions.innerHTML = `
      <button class="likeBtn" data-id="${p._id}">Like (${likes})</button>
      <button class="commentBtn" data-id="${p._id}">Comment (${comments})</button>
    `;
    card.appendChild(actions);

    container.appendChild(card);
  });

  // Delete
  document.querySelectorAll('.delBtn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      if(!confirm('Delete this post?')) return;
      await fetch(`${API_BASE}/api/posts/${id}`, { method:'DELETE', headers: { 'Authorization':'Bearer ' + TOKEN }});
      loadPosts();
    });
  });

  // Like
  document.querySelectorAll('.likeBtn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      await fetch(`${API_BASE}/api/posts/like/${id}`, { method:'POST', headers: { 'Authorization':'Bearer ' + TOKEN }});
      loadPosts();
    });
  });

  // Comment
  document.querySelectorAll('.commentBtn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      const text = prompt('Write comment:');
      if(!text) return;
      await fetch(`${API_BASE}/api/posts/comment/${id}`, {
        method:'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + TOKEN },
        body: JSON.stringify({ text })
      });
      loadPosts();
    });
  });
}

loadPosts();