document.addEventListener('DOMContentLoaded', function() {
    const closeButton = document.getElementById('close-manual');
    
    closeButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}); 