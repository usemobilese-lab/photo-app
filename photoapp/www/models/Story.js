// frontend/js/stories.js
const API_BASE = "http://192.168.18.189:8080";
const TOKEN = localStorage.getItem('token');
const USER = JSON.parse(localStorage.getItem('user') || 'null');

if(!TOKEN || !USER) window.location.href='index.html';

const storiesBar = document.getElementById('storiesBar');
const myStoryPic = document.getElementById('myStoryPic');
myStoryPic.src = USER.profilePic || 'images/placeholder.png';

async function loadStories(){
  const res = await fetch(`${API_BASE}/api/stories`, { headers: { 'Authorization': 'Bearer ' + TOKEN }});
  const stories = await res.json();
  renderStories(stories);
}
function renderStories(stories){
  // keep my story as first element
  storiesBar.innerHTML = `
    <div class="story">
      <label for="storyUpload"><img id="myStoryPic" src="${USER.profilePic || 'images/placeholder.png'}" title="Add story"></label>
      <input id="storyUpload" type="file" accept="image/*,video/*" style="display:none;">
      <small class="small">Add Story</small>
    </div>
  `;
  const unique = {};
  stories.forEach(s => { if(!unique[s.userEmail]) unique[s.userEmail] = s; }); // latest per user
  Object.values(unique).forEach(s => {
    const div = document.createElement('div'); div.className='story';
    div.innerHTML = `<img src="${API_BASE}${s.profilePic}" data-email="${s.userEmail}"><small class="small">${s.userName.split(' ')[0]}</small>`;
    const img = div.querySelector('img');
    img.addEventListener('click', ()=> openStory(s.userEmail, stories.filter(x=>x.userEmail===s.userEmail)));
    storiesBar.appendChild(div);
  });
  // attach upload
  document.getElementById('storyUpload').addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const fd = new FormData(); fd.append('media', file);
    const res = await fetch(`${API_BASE}/api/stories`, { method:'POST', headers: { 'Authorization': 'Bearer ' + TOKEN }, body: fd });
    if(res.ok){ alert('Story uploaded'); loadStories(); } else { alert('Story upload failed'); }
  });
}

// story viewer
function openStory(email, userStories){
  const viewer = document.getElementById('storyViewer');
  const content = document.getElementById('storyContent');
  if(!userStories || userStories.length===0){
    // fetch if not passed
    fetch(`${API_BASE}/api/stories`, { headers: { 'Authorization': 'Bearer ' + TOKEN }})
      .then(r=>r.json()).then(all => {
        const u = all.filter(s=>s.userEmail===email);
        showSequence(u);
      });
  } else showSequence(userStories);

  function showSequence(arr){
    let idx = 0;
    viewer.style.display = 'flex';
    function show(){
      const s = arr[idx];
      content.innerHTML = '';
      if(s.type === 'image'){ const img = document.createElement('img'); img.src = `${API_BASE}${s.media}`; img.style.maxWidth='100%'; img.style.maxHeight='90vh'; content.appendChild(img);}
      else { const v = document.createElement('video'); v.src = `${API_BASE}${s.media}`; v.autoplay=true; v.controls=true; v.style.maxWidth='100%'; v.style.maxHeight='90vh'; content.appendChild(v); }
    }
    show();
    const timer = setInterval(()=>{ idx++; if(idx>=arr.length){ clearInterval(timer); viewer.style.display='none'; } else show(); }, 5000);
    document.getElementById('closeStory').onclick = ()=> { clearInterval(timer); viewer.style.display='none'; };
  }
}

loadStories();