// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize timestamp
    updateTimestamp();
    
    // Get DOM elements
    const contentDiv = document.getElementById('content-to-share');
    const shareBtn = document.getElementById('share-whatsapp-btn');
    const shareGeneralBtn = document.getElementById('share-general-btn');
    const copyClipboardBtn = document.getElementById('copy-clipboard-btn');
    const previewBtn = document.getElementById('preview-btn');
    const customizeBtn = document.getElementById('customize-btn');
    const modal = document.getElementById('preview-modal');
    const closeModal = document.querySelector('.close');
    const previewContainer = document.getElementById('preview-container');
    const downloadBtn = document.getElementById('download-btn');
    const modalShareBtn = document.getElementById('modal-share-btn');
    const loading = document.getElementById('loading');
    
    // Store the current image blob and data URL
    let currentImageBlob = null;
    let currentImageDataUrl = null;
    
    // Configuration for image generation
    const imageConfig = {
        quality: 0.95,
        pixelRatio: 2, // Higher quality for retina displays
        cacheBust: true,
    };
    
    // Update timestamp
    function updateTimestamp() {
        const now = new Date();
        const timestampEl = document.getElementById('timestamp');
        if (timestampEl) {
            timestampEl.textContent = now.toLocaleString();
        }
    }
    
    // Show loading indicator
    function showLoading() {
        loading.classList.add('active');
    }
    
    // Hide loading indicator
    function hideLoading() {
        loading.classList.remove('active');
    }
    
    // Show status message
    function showStatus(message, type = 'success') {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;
        
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }
    
    // Convert div to image blob
    async function convertToBlob() {
        try {
            showLoading();
            
            // Use html-to-image library to convert div to blob
            const blob = await htmlToImage.toBlob(contentDiv, imageConfig);
            
            hideLoading();
            return blob;
        } catch (error) {
            hideLoading();
            console.error('Error converting to blob:', error);
            showStatus('Failed to generate image. Please try again.', 'error');
            throw error;
        }
    }
    
    // Convert div to data URL (for preview)
    async function convertToDataUrl() {
        try {
            showLoading();
            
            // Use html-to-image library to convert div to PNG data URL
            const dataUrl = await htmlToImage.toPng(contentDiv, imageConfig);
            
            hideLoading();
            return dataUrl;
        } catch (error) {
            hideLoading();
            console.error('Error converting to data URL:', error);
            showStatus('Failed to generate image. Please try again.', 'error');
            throw error;
        }
    }
    
    // Check if Web Share API is available
    function isWebShareSupported() {
        return navigator.share && navigator.canShare;
    }
    
    // Share using Web Share API (direct sharing without upload)
    async function shareWithWebShareAPI(blob, forWhatsApp = false) {
        try {
            // Create a File object from the blob
            const file = new File([blob], 'share-image.png', { type: 'image/png' });
            
            // Prepare share data
            const shareData = {
                title: 'Check out this awesome content!',
                text: 'I created this with my awesome app! 🎨',
                files: [file]
            };
            
            // Check if this data can be shared
            if (navigator.canShare && !navigator.canShare(shareData)) {
                console.log('Cannot share files, trying text-only share');
                throw new Error('This content cannot be shared');
            }
            
            // Share using native share dialog
            await navigator.share(shareData);
            return true;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled the share
                console.log('Share cancelled by user');
                return false;
            }
            throw error;
        }
    }
    
    // Detect if user is on mobile
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Create a shareable link using whatsapp:// URL scheme (mobile only)
    function shareViaWhatsAppScheme(blob) {
        // On mobile, we can use the whatsapp:// URL scheme
        // However, we still need to handle the image somehow
        
        // Option 1: Download the image and open WhatsApp
        // The user can then manually attach the downloaded image
        const link = document.createElement('a');
        link.download = `share-image-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        // Open WhatsApp
        setTimeout(() => {
            // Try WhatsApp app on mobile
            if (isMobileDevice()) {
                window.location.href = 'whatsapp://send?text=' + encodeURIComponent('Check out this image I created! 🎨');
            } else {
                window.open('https://web.whatsapp.com/', '_blank');
            }
        }, 500);
        
        showStatus('Image downloaded! Select it in WhatsApp to share.', 'success');
    }
    
    // Fallback: Create WhatsApp link with data URL
    function shareWithWhatsAppLink(dataUrl) {
        // For desktop or when Web Share API is not available
        // We'll open WhatsApp with a message asking user to manually share
        const shareText = "Check out this awesome content I created! 🎨\n\nPlease download the image below and share it manually.";
        const encodedMessage = encodeURIComponent(shareText);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Also trigger download so user has the image
        downloadImage();
        
        showStatus('Image downloaded! Please share manually on WhatsApp.', 'success');
    }
    
    // Alternative method: Copy image to clipboard (for easy pasting in WhatsApp)
    async function copyImageToClipboard() {
        try {
            if (!currentImageBlob) {
                currentImageBlob = await convertToBlob();
            }
            
            // Modern Clipboard API for images
            if (navigator.clipboard && navigator.clipboard.write) {
                const item = new ClipboardItem({ 'image/png': currentImageBlob });
                await navigator.clipboard.write([item]);
                
                showStatus('Image copied to clipboard! You can paste it in WhatsApp now. 📋', 'success');
                
                // Open WhatsApp
                const whatsappUrl = 'https://web.whatsapp.com/';
                window.open(whatsappUrl, '_blank');
                
                return true;
            } else {
                throw new Error('Clipboard API not supported');
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            showStatus('Could not copy to clipboard. Please use download option.', 'error');
            return false;
        }
    }
    
    // Share on WhatsApp
    async function shareOnWhatsApp() {
        try {
            updateTimestamp(); // Update timestamp before generating
            
            // Generate image blob
            if (!currentImageBlob) {
                currentImageBlob = await convertToBlob();
            }
            
            if (!currentImageDataUrl) {
                currentImageDataUrl = await convertToDataUrl();
            }
            
            hideLoading();
            
            // On mobile devices, use WhatsApp URL scheme
            if (isMobileDevice()) {
                console.log('Mobile device detected - using WhatsApp scheme');
                shareViaWhatsAppScheme(currentImageBlob);
            } 
            // On desktop with Web Share API support
            else if (isWebShareSupported()) {
                console.log('Desktop with Web Share API - showing options');
                
                const choice = confirm(
                    "📱 Share Image to WhatsApp\n\n" +
                    "Choose your method:\n" +
                    "• OK - Use system share (may not show WhatsApp)\n" +
                    "• Cancel - Copy to clipboard & open WhatsApp Web"
                );
                
                if (choice) {
                    showLoading();
                    try {
                        const shared = await shareWithWebShareAPI(currentImageBlob);
                        hideLoading();
                        
                        if (shared) {
                            showStatus('Image shared successfully! 🎉', 'success');
                        }
                    } catch (shareError) {
                        hideLoading();
                        console.warn('Web Share API failed, trying clipboard:', shareError);
                        await copyImageToClipboard();
                    }
                } else {
                    await copyImageToClipboard();
                }
            } 
            // Desktop without Web Share API
            else {
                console.log('Desktop without Web Share API - using clipboard method');
                
                const choice = confirm(
                    "📱 Share Image to WhatsApp\n\n" +
                    "Choose your method:\n" +
                    "• OK - Copy to clipboard & open WhatsApp Web\n" +
                    "• Cancel - Download image manually"
                );
                
                if (choice) {
                    await copyImageToClipboard();
                } else {
                    shareWithWhatsAppLink(currentImageDataUrl);
                }
            }
            
        } catch (error) {
            console.error('Error sharing on WhatsApp:', error);
            showStatus('Failed to share. Please try the preview and download option.', 'error');
        }
    }
    
    // Show preview modal
    async function showPreview() {
        try {
            // Generate image if not already generated
            if (!currentImageDataUrl) {
                currentImageDataUrl = await convertToDataUrl();
                currentImageBlob = await convertToBlob();
            }
            
            // Clear previous preview
            previewContainer.innerHTML = '';
            
            // Create and display image
            const img = document.createElement('img');
            img.src = currentImageDataUrl;
            img.alt = 'Preview of content';
            previewContainer.appendChild(img);
            
            // Show modal
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error showing preview:', error);
            showStatus('Failed to generate preview', 'error');
        }
    }
    
    // Download image
    function downloadImage() {
        if (!currentImageDataUrl) {
            showStatus('Please generate image first', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `share-image-${Date.now()}.png`;
        link.href = currentImageDataUrl;
        link.click();
        
        showStatus('Image downloaded successfully!', 'success');
    }
    
    // Customize content
    function customizeContent() {
        const header = contentDiv.querySelector('.header h2');
        const body = contentDiv.querySelector('.body > p');
        
        const newHeader = prompt('Enter new header text:', header.textContent);
        if (newHeader) {
            header.textContent = newHeader;
        }
        
        const newBody = prompt('Enter new body text:', body.textContent);
        if (newBody) {
            body.textContent = newBody;
        }
        
        // Reset cached images
        currentImageBlob = null;
        currentImageDataUrl = null;
        
        updateTimestamp();
        showStatus('Content updated!', 'success');
    }
    
    // General share function (uses Web Share API)
    async function shareGeneral() {
        try {
            updateTimestamp();
            
            if (!currentImageBlob) {
                currentImageBlob = await convertToBlob();
            }
            
            if (!currentImageDataUrl) {
                currentImageDataUrl = await convertToDataUrl();
            }
            
            hideLoading();
            
            if (isWebShareSupported()) {
                showLoading();
                try {
                    const shared = await shareWithWebShareAPI(currentImageBlob, false);
                    hideLoading();
                    
                    if (shared) {
                        showStatus('Image shared successfully! 🎉', 'success');
                    }
                } catch (error) {
                    hideLoading();
                    console.warn('General share failed:', error);
                    showStatus('Share cancelled or not available', 'error');
                }
            } else {
                showStatus('Sharing not supported on this browser', 'error');
                showPreview();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            showStatus('Failed to share', 'error');
        }
    }
    
    // Event Listeners
    shareBtn.addEventListener('click', shareOnWhatsApp);
    shareGeneralBtn.addEventListener('click', shareGeneral);
    copyClipboardBtn.addEventListener('click', copyImageToClipboard);
    previewBtn.addEventListener('click', showPreview);
    customizeBtn.addEventListener('click', customizeContent);
    downloadBtn.addEventListener('click', downloadImage);
    modalShareBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        shareOnWhatsApp();
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Escape to close modal
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
        
        // Ctrl/Cmd + S to share
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            shareOnWhatsApp();
        }
        
        // Ctrl/Cmd + P to preview
        if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
            event.preventDefault();
            showPreview();
        }
    });
    
    // Log initialization info
    console.log('✅ WhatsApp Share App initialized successfully!');
    console.log('\n📱 Device Info:');
    console.log('  - Mobile Device:', isMobileDevice() ? '✅ Yes' : '❌ No (Desktop)');
    console.log('  - Web Share API:', isWebShareSupported() ? '✅ Supported' : '❌ Not available');
    console.log('  - Clipboard API:', navigator.clipboard ? '✅ Supported' : '❌ Not available');
    console.log('\n💡 Button Guide:');
    console.log('  📱 Share to WhatsApp - Downloads image + opens WhatsApp (mobile) OR copies to clipboard (desktop)');
    console.log('  � Share Anywhere - Uses system share dialog (works with multiple apps)');
    console.log('  📋 Copy Image - Copy to clipboard and open WhatsApp Web');
    console.log('  👁️ Preview - See the generated image');
    console.log('  🎨 Customize - Edit the content');
    console.log('\n⚠️ Important: WhatsApp does NOT support direct image sharing via web APIs.');
    console.log('   Images must be downloaded/copied first, then shared within the app.');
});
