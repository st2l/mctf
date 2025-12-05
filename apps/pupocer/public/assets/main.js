function toggleThreadForm() {
    const form = document.getElementById('new-thread-form');
    if (form.style.display === 'none') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

function toggleReplyForm(postId) {
    const form = document.getElementById('reply-form-' + postId);
    const parentPost = document.getElementById('post-' + postId);
    
    // Hide all other reply forms
    document.querySelectorAll('.reply-form-container').forEach(f => {
        if (f.id !== 'reply-form-' + postId) {
            f.style.display = 'none';
        }
    });
    
    // Remove highlighting from all posts
    document.querySelectorAll('.data-packet').forEach(p => {
        p.classList.remove('reply-highlight');
    });
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        
        // Highlight the parent post being replied to
        if (parentPost) {
            parentPost.classList.add('reply-highlight');
        }
        
        // Focus the textarea
        const textarea = form.querySelector('textarea');
        if (textarea) {
            textarea.focus();
        }
    } else {
        form.style.display = 'none';
        
        // Remove highlighting
        if (parentPost) {
            parentPost.classList.remove('reply-highlight');
        }
    }
}

// Auto-hide reply forms when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.reply-form-container') && !event.target.closest('.cyber-button')) {
        document.querySelectorAll('.reply-form-container').forEach(form => {
            form.style.display = 'none';
        });
        document.querySelectorAll('.data-packet').forEach(p => {
            p.classList.remove('reply-highlight');
        });
    }
});

// Smooth scroll to reply form
function scrollToReplyForm(postId) {
    const form = document.getElementById('reply-form-' + postId);
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}