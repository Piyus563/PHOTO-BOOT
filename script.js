const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const download = document.getElementById("download");
const countdown = document.getElementById("countdown");
const photosDiv = document.getElementById("photos");

let currentFilter = "none";
let capturedPhotos = [];
let isCollageMode = false;

// Camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

function setFilter(filter) {
  currentFilter = filter;
  video.style.filter = filter;
}

function capture() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0);
  
  download.href = canvas.toDataURL("image/png");
}

function startCollage() {
  if (isCollageMode) return;
  
  isCollageMode = true;
  capturedPhotos = [];
  photosDiv.innerHTML = "";
  
  captureSequence(0);
}

function captureSequence(photoIndex) {
  if (photoIndex >= 3) {
    createCollage();
    isCollageMode = false;
    return;
  }
  
  // Countdown
  let count = 3;
  countdown.textContent = count;
  
  const countInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count;
    } else {
      countdown.textContent = "📸";
      clearInterval(countInterval);
      
      // Capture photo
      setTimeout(() => {
        capturePhoto(photoIndex);
        countdown.textContent = "";
        
        // Next photo after 1 second
        setTimeout(() => {
          captureSequence(photoIndex + 1);
        }, 1000);
      }, 200);
    }
  }, 1000);
}

function capturePhoto(index) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0);
  
  const photoData = canvas.toDataURL("image/png");
  capturedPhotos.push(photoData);
  
  // Show captured photo
  const img = document.createElement("img");
  img.src = photoData;
  photosDiv.appendChild(img);
}

function createCollage() {
  const collageCanvas = document.createElement("canvas");
  const collageCtx = collageCanvas.getContext("2d");
  
  // Set collage size for vertical layout
  collageCanvas.width = 420;
  collageCanvas.height = 840;
  collageCanvas.className = "collage-canvas";
  
  // Gradient background
  const gradient = collageCtx.createLinearGradient(0, 0, 420, 840);
  gradient.addColorStop(0, '#ffd700');
  gradient.addColorStop(0.5, '#ffed4e');
  gradient.addColorStop(1, '#ffd700');
  collageCtx.fillStyle = gradient;
  collageCtx.fillRect(0, 0, 420, 840);
  
  // Load and draw photos vertically with decorative frames
  let loadedCount = 0;
  capturedPhotos.forEach((photoData, index) => {
    const img = new Image();
    img.onload = () => {
      const x = 30;
      const y = 30 + (index * 260);
      
      // Draw decorative frame
      collageCtx.fillStyle = '#ffffff';
      collageCtx.fillRect(x - 15, y - 15, 370, 240);
      
      // Inner shadow effect
      collageCtx.fillStyle = '#f0f0f0';
      collageCtx.fillRect(x - 10, y - 10, 360, 230);
      
      // Draw photo
      collageCtx.drawImage(img, x, y, 340, 200);
      
      // Add corner decorations
      collageCtx.fillStyle = '#FDBCB4';
      const corners = [[x-15, y-15], [x+340, y-15], [x-15, y+210], [x+340, y+210]];
      corners.forEach(([cx, cy]) => {
        collageCtx.fillRect(cx, cy, 15, 15);
      });
      
      loadedCount++;
      if (loadedCount === 3) {
        photosDiv.innerHTML = "";
        photosDiv.appendChild(collageCanvas);
        
        download.href = collageCanvas.toDataURL("image/png");
        download.download = "collage.png";
      }
    };
    img.src = photoData;
  });
}