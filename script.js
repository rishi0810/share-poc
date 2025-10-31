// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const shareBtn = document.getElementById('share-whatsapp-btn');
    const copyUrlBtn = document.getElementById('copy-url-btn');
    const viewMetaBtn = document.getElementById('view-meta-btn');
    const testImageBtn = document.getElementById('test-image-btn');
    const currentPageUrl = window.location.href;
    const shareMessage = "Check out this awesome content! 🎨";
    
    document.getElementById('share-url').textContent = currentPageUrl;
    
    function showStatus(message, type = 'success') {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = `status-message show ${type}`;
        setTimeout(() => statusEl.classList.remove('show'), 3000);
    }
    
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    function sharePageOnWhatsApp() {
        const fullMessage = `${shareMessage}\n\n${currentPageUrl}`;
        const encodedMessage = encodeURIComponent(fullMessage);
        const whatsappUrl = isMobileDevice() 
            ? `whatsapp://send?text=${encodedMessage}`
            : `https://web.whatsapp.com/send?text=${encodedMessage}`;
        
        isMobileDevice() ? window.location.href = whatsappUrl : window.open(whatsappUrl, '_blank');
        showStatus('Opening WhatsApp with message and link...', 'success');
    }
    
    async function copyPageUrl() {
        try {
            await navigator.clipboard.writeText(currentPageUrl);
            showStatus('Page URL copied to clipboard! 📋', 'success');
        } catch (error) {
            showStatus('Could not copy URL', 'error');
        }
    }
    
    function viewMetaTags() {
        let metaInfo = '🏷️ Open Graph Meta Tags:\n\n';
        document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
            metaInfo += `${tag.getAttribute('property')}: ${tag.getAttribute('content')}\n`;
        });
        alert(metaInfo + '\n\n💡 These tags tell WhatsApp how to display the rich preview!');
    }
    
    function testImageLink() {
        const imageUrl = 'https://i.postimg.cc/9fbJXsHY/resumelogo.png';
        if (confirm('⚠️ Direct Image Link vs Page Link\n\nDirect image URL shows only small thumbnail.\nThis PAGE URL shows rich preview with Open Graph tags!\n\nOpen the direct image link?')) {
            window.open(imageUrl, '_blank');
        }
    }
    
    shareBtn.addEventListener('click', sharePageOnWhatsApp);
    copyUrlBtn.addEventListener('click', copyPageUrl);
    viewMetaBtn.addEventListener('click', viewMetaTags);
    testImageBtn.addEventListener('click', testImageLink);
    
    console.log('✅ WhatsApp Rich Preview Demo initialized!');
    console.log('📱 Mobile:', isMobileDevice() ? 'Yes' : 'No');
    console.log('🎯 Share this URL:', currentPageUrl);
});
