/**
 * Login and Signup functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validate inputs
        if (!email || !password) {
            showAlert(loginAlert, 'Please fill in all fields');
            return;
        }
        
        // Send login request
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                showAlert(loginAlert, data.message);
            }
        })
        .catch(error => {
            showAlert(loginAlert, 'An error occurred. Please try again.');
            console.error('Login error:', error);
        });
    });
    
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    const signupAlert = document.getElementById('signupAlert');
    const signupSuccess = document.getElementById('signupSuccess');
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            showAlert(signupAlert, 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showAlert(signupAlert, 'Passwords do not match');
            return;
        }
        
        // Send signup request
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                hideAlert(signupAlert);
                showSuccess(signupSuccess, data.message);
                
                // Clear form
                signupForm.reset();
                
                // Switch to login tab after 2 seconds
                setTimeout(() => {
                    document.getElementById('login-tab').click();
                }, 2000);
            } else {
                showAlert(signupAlert, data.message);
                hideAlert(signupSuccess);
            }
        })
        .catch(error => {
            showAlert(signupAlert, 'An error occurred. Please try again.');
            hideAlert(signupSuccess);
            console.error('Signup error:', error);
        });
    });
    
    // Helper functions
    function showAlert(element, message) {
        element.textContent = message;
        element.classList.remove('d-none');
    }
    
    function hideAlert(element) {
        element.classList.add('d-none');
    }
    
    function showSuccess(element, message) {
        element.textContent = message;
        element.classList.remove('d-none');
    }
});
