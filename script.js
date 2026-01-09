const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const download = document.getElementById("download");
const countdown = document.getElementById("countdown");
const photosDiv = document.getElementById("photos");

let currentFilter = "none";
let capturedPhotos = [];
let isCollageMode = false;

// Camera access with higher quality
navigator.mediaDevices.getUserMedia({ 
  video: { 
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: 'user'
  } 
})
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
  
  // Higher resolution collage
  collageCanvas.width = 800;
  collageCanvas.height = 1600;
  collageCanvas.className = "collage-canvas";
  
  // Enable image smoothing for better quality
  collageCtx.imageSmoothingEnabled = true;
  collageCtx.imageSmoothingQuality = 'high';
  
  // Gradient background
  const gradient = collageCtx.createLinearGradient(0, 0, 800, 1600);
  gradient.addColorStop(0, '#ffd700');
  gradient.addColorStop(0.5, '#ffed4e');
  gradient.addColorStop(1, '#ffd700');
  collageCtx.fillStyle = gradient;
  collageCtx.fillRect(0, 0, 800, 1600);
  
  // Load and draw photos vertically with decorative frames
  let loadedCount = 0;
  capturedPhotos.forEach((photoData, index) => {
    const img = new Image();
    img.onload = () => {
      const x = 60;
      const y = 60 + (index * 520);
      
      // Draw decorative frame
      collageCtx.fillStyle = '#ffffff';
      collageCtx.fillRect(x - 30, y - 30, 740, 480);
      
      // Inner shadow effect
      collageCtx.fillStyle = '#f0f0f0';
      collageCtx.fillRect(x - 20, y - 20, 720, 460);
      
      // Draw photo at higher resolution
      collageCtx.drawImage(img, x, y, 680, 400);
      
      // Add corner decorations
      collageCtx.fillStyle = '#FDBCB4';
      const corners = [[x-30, y-30], [x+680, y-30], [x-30, y+420], [x+680, y+420]];
      corners.forEach(([cx, cy]) => {
        collageCtx.fillRect(cx, cy, 30, 30);
      });
      
      loadedCount++;
      if (loadedCount === 3) {
        photosDiv.innerHTML = "";
        photosDiv.appendChild(collageCanvas);
        
        download.href = collageCanvas.toDataURL("image/png", 1.0);
        download.download = "collage.png";
      }
    };
    img.src = photoData;
  });
}
