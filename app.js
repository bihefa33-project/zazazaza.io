const GITHUB_USER = 'bihefa33-project';
const GITHUB_REPO = 'zazazaza';

// Daftar folder sesuai dengan kebutuhan kamu
const folderMapping = [
  { name: '1. Generate sendiri full NDS', path: 'gallery/1-generate-sendiri-full-nds' },
  { name: '2. Generate publik full NDS', path: 'gallery/2-generate-publik-full-nds' },
  { name: '3. Generate sendiri half NDS', path: 'gallery/3-generate-sendiri-half-nds' },
  { name: '4. Generate publik half NDS', path: 'gallery/4-generate-publik-half-nds' },
  { name: '5. Edit AI sendiri', path: 'gallery/5-edit-ai-sendiri' },
  { name: '6. Edit AI publik', path: 'gallery/6-edit-ai-publik' },
  { name: '7. Video AI', path: 'gallery/7-video-ai' },
  { name: '8. Video real', path: 'gallery/8-video-real' }
];

const gridContainer = document.getElementById('contentGrid');
const currentTitle = document.getElementById('currentTitle');
const backBtn = document.getElementById('backBtn');
const modal = document.getElementById('mediaModal');
const modalWrapper = document.getElementById('modalWrapper');
const closeModal = document.getElementById('closeModal');
const downloadBtn = document.getElementById('downloadBtn');

// Tampilkan Folder Utama
function renderFolders() {
  currentTitle.textContent = 'Drive Saya';
  backBtn.classList.add('hidden');
  gridContainer.innerHTML = '';

  folderMapping.forEach(folder => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="material-symbols-outlined icon">folder</span>
      <div class="card-title">${folder.name}</div>
    `;
    card.onclick = () => loadFolderContents(folder.path, folder.name);
    gridContainer.appendChild(card);
  });
}

// Fetch file dari folder GitHub
async function loadFolderContents(folderPath, folderName) {
  currentTitle.textContent = folderName;
  backBtn.classList.remove('hidden');
  gridContainer.innerHTML = '<div class="loading">Memuat media...</div>';

  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${folderPath}`;

  try {
    const response = await fetch(apiUrl);
    
    if (response.status === 404) {
      throw new Error(`Folder "${folderPath}" belum dibuat di repository GitHub! Pastikan ada file (misal .gitkeep) di dalam foldernya.`);
    } else if (response.status === 403) {
      throw new Error(`Batas kuota akses GitHub API habis (Rate Limit). Tunggu beberapa menit.`);
    } else if (!response.ok) {
      throw new Error(`HTTP Status Error: ${response.status}`);
    }
    
    const files = await response.json();
    gridContainer.innerHTML = '';

    const mediaFiles = files.filter(file => file.type === 'file' && !file.name.startsWith('.'));

    if (mediaFiles.length === 0) {
      gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Folder ini masih kosong.</p>';
      return;
    }

    mediaFiles.forEach(file => {
      const isVideo = file.name.match(/\.(mp4|webm|ogg|mov)$/i);
      const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

      if (!isImage && !isVideo) return;

      const rawUrl = file.download_url;
      const card = document.createElement('div');
      card.className = 'card';

      if (isImage) {
        card.innerHTML = `
          <img src="${rawUrl}" class="card-preview" alt="${file.name}" loading="lazy">
          <div class="card-title">${file.name}</div>
          <div class="card-actions">
            <a href="${rawUrl}" download target="_blank" class="download-link" onclick="event.stopPropagation()">
              <span class="material-symbols-outlined">download</span> Unduh
            </a>
          </div>
        `;
        card.onclick = () => openModal('image', rawUrl, file.name);
      } else if (isVideo) {
        card.innerHTML = `
          <video src="${rawUrl}" class="card-preview" muted></video>
          <div class="card-title">${file.name}</div>
          <div class="card-actions">
            <a href="${rawUrl}" download target="_blank" class="download-link" onclick="event.stopPropagation()">
              <span class="material-symbols-outlined">download</span> Unduh
            </a>
          </div>
        `;
        card.onclick = () => openModal('video', rawUrl, file.name);
      }

      gridContainer.appendChild(card);
    });

  } catch (error) {
    gridContainer.innerHTML = `<div style="grid-column: 1/-1; color:#ff4d4d; padding:20px; background:#2d1b1b; border-radius:10px;">
      <p><strong>Gagal Memuat Media:</strong></p>
      <p>${error.message}</p>
    </div>`;
  }
}

// Modal Lightbox & Zoom
function openModal(type, url, filename) {
  modalWrapper.innerHTML = '';
  downloadBtn.href = url;
  downloadBtn.setAttribute('download', filename);

  if (type === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.onclick = () => img.classList.toggle('zoomed');
    modalWrapper.appendChild(img);
  } else if (type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.onclick = () => video.classList.toggle('zoomed');
    modalWrapper.appendChild(video);
  }

  modal.classList.remove('hidden');
}

closeModal.onclick = () => {
  modal.classList.add('hidden');
  modalWrapper.innerHTML = '';
};

backBtn.onclick = renderFolders;

// Start App
renderFolders();
