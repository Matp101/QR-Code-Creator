let uploadedLogo = null;  // Global variable to store the uploaded logo image

// Function to preview the uploaded logo image
function previewLogo() {
    const fileInput = document.getElementById('logo-upload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedLogo = e.target.result;  // Save the image data for later use
        };
        reader.readAsDataURL(file);
    } else {
        uploadedLogo = null;
    }
}

// Function to generate the QR code with the custom options
function generateQRCode() {
    const url = document.getElementById('url').value.trim();
    const urlError = document.getElementById('url-error');

    // Check if the URL is provided
    if (url === "") {
        urlError.style.display = 'block';
        return;
    } else {
        urlError.style.display = 'none';
    }

    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = '';  // Clear previous QR code
    const fillColor = document.getElementById('fill-color').value;
    const backgroundColor = document.getElementById('background-color').value;
    const transparentBackground = document.getElementById('transparent-background').checked;
    const logoSize = parseInt(document.getElementById('logo-size').value);
    const logoBgColor = document.getElementById('logo-bg-color').value;
    const transparentLogoBg = document.getElementById('transparent-logo-bg').checked;
    const logoBgShape = document.getElementById('logo-bg-shape').value;

    // Handle transparent QR code background
    const qrBgColor = transparentBackground ? 'rgba(255, 255, 255, 0)' : backgroundColor;

    // Generate QR code
    const qrCode = new QRCode(qrCodeContainer, {
        text: url,
        width: 256,
        height: 256,
        colorDark: fillColor,
        colorLight: qrBgColor,
    });

    // If a logo is uploaded, add it to the QR code
    if (uploadedLogo) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const qrCanvas = qrCodeContainer.querySelector('canvas');
        canvas.width = qrCanvas.width;
        canvas.height = qrCanvas.height;
        ctx.drawImage(qrCanvas, 0, 0);

        const img = new Image();
        img.src = uploadedLogo;
        img.onload = function () {
            // Maintain aspect ratio of the logo
            const aspectRatio = img.width / img.height;
            let logoWidth, logoHeight;

            // Fit the logo size within the logo size dimensions while keeping aspect ratio
            if (img.width > img.height) {
                logoWidth = logoSize;
                logoHeight = logoSize / aspectRatio;
            } else {
                logoWidth = logoSize * aspectRatio;
                logoHeight = logoSize;
            }

            // Draw the logo background (round or square)
            if (!transparentLogoBg) {
                ctx.fillStyle = logoBgColor;
                if (logoBgShape === 'round') {
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (logoBgShape === 'square') {
                    const x = (canvas.width - logoSize) / 2;
                    const y = (canvas.height - logoSize) / 2;
                    ctx.fillRect(x, y, logoSize, logoSize);
                }
            }

            // Draw the logo in the center, maintaining aspect ratio
            const x = (canvas.width - logoWidth) / 2;
            const y = (canvas.height - logoHeight) / 2;
            ctx.drawImage(img, x, y, logoWidth, logoHeight);

            const qrImage = canvas.toDataURL("image/png");

            // Replace the QR code canvas with the one that includes the logo
            qrCodeContainer.innerHTML = `<img src="${qrImage}" alt="QR Code with Logo">`;

            // Show the download button
            document.getElementById('download-btn').style.display = 'block';
        };
    } else {
        // No logo, just show the QR code and enable download
        document.getElementById('download-btn').style.display = 'block';
    }
}

// Function to download the generated QR code
function downloadQRCode() {
    const qrCanvas = document.querySelector('#qrcode canvas');
    if (qrCanvas) {
        const link = document.createElement('a');
        link.download = 'qr_code.png';
        link.href = qrCanvas.toDataURL();
        link.click();
    }
}
