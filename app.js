const GITHUB_USER = 'bihefa33-project';
const GITHUB_REPO = 'zazazaza';
const BASE_FOLDER = 'gallery';

const folderMapping = [
  { name: '1. Generate sendiri full NDS', path: `${BASE_FOLDER}/1-generate-sendiri-full-nds` },
  { name: '2. Generate publik full NDS', path: `${BASE_FOLDER}/2-generate-publik-full-nds` },
  { name: '3. Generate sendiri half NDS', path: `${BASE_FOLDER}/3-generate-sendiri-half-nds` },
  { name: '4. Generate publik half NDS', path: `${BASE_FOLDER}/4-generate-publik-half-nds` },
  { name: '5. Edit AI sendiri', path: `${BASE_FOLDER}/5-edit-ai-sendiri` },
  { name: '6. Edit AI publik', path: `${BASE_FOLDER}/6-edit-ai-publik` },
  { name: '7. Video AI', path: `${BASE_FOLDER}/7-video-ai` },
  { name: '8. Video real', path: `${BASE_FOLDER}/8-video-real` }
];

const gridContainer = document.getElementById('contentGrid');
const currentTitle = document.getElementById('currentTitle');
const backBtn = document.getElementById('backBtn');
const modal = document.getElementById('mediaModal');
const modalWrapper = document.getElementById('modalWrapper');
const closeModal = document.getElementById('closeModal');
const downloadBtn = document.getElementById('downloadBtn');

let isFolderView = true;

// Load Root View (Daftar Folder Utama)
function renderFolders() {
  isFolderView = true;
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

// Fetch isi folder secara otomatis dari GitHub API
async function loadFolderContents(folderPath, folderName) {
  isFolderView = false;
  currentTitle.textContent = folderName;
  backBtn.classList.remove('hidden');
  gridContainer.innerHTML = '<div class="loading">Memuat media...</div>';

  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${folderPath}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Gagal mengambil data dari GitHub');
    
    const files = await response.json();
    gridContainer.innerHTML = '';

    const mediaFiles = files.filter(file => file.type === 'file');

    if (mediaFiles.length === 0) {
      gridContainer.innerHTML = '<p>Folder ini masih kosong.</p>';
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
            <a href="${rawUrl}" download class="download-link" onclick="event.stopPropagation()">
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
            <a href="${rawUrl}" download class="download-link" onclick="event.stopPropagation()">
              <span class="material-symbols-outlined">download</span> Unduh
            </a>
          </div>
        `;
        card.onclick = () => openModal('video', rawUrl, file.name);
      }

      gridContainer.appendChild(card);
    });

  } catch (error) {
    gridContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}

// Open Lightbox Modal (Zoom, Play/Pause Video, & Direct Download)
function openModal(type, url, filename) {
  modalWrapper.innerHTML = '';
  downloadBtn.href = url;
  downloadBtn.setAttribute('download', filename);

  if (type === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.onclick = () => img.classList.toggle('zoomed'); // Toggle zoom saat diklik
    modalWrapper.appendChild(img);
  } else if (type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true; // Menyediakan Play, Pause, & Progress Bar
    video.autoplay = true;
    video.onclick = (e) => {
      // Toggle Zoom pada video tanpa mengganggu fungsi Play/Pause
      if (e.target === video) {
        video.classList.toggle('zoomed');
      }
    };
    modalWrapper.appendChild(video);
  }

  modal.classList.remove('hidden');
}

// Close Modal
closeModal.onclick = () => {
  modal.classList.add('hidden');
  modalWrapper.innerHTML = '';
};

backBtn.onclick = renderFolders;

// Initialize
renderFolders();
                       
