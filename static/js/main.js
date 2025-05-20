/**
 * Main JavaScript for the Cricket Image Chatbot
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize session state
    window.sessionState = {
        chatHistory: [],
        currentQuery: '',
        feedbackGiven: new Set(),
        similarityThreshold: 0.4
    };
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('An error occurred during logout. Please try again.');
            });
        });
    }
    
    // Load query history
    loadQueryHistory();
    
    // Helper functions
    function loadQueryHistory() {
        const queryHistoryContainer = document.getElementById('queryHistory');
        
        fetch('/api/user_queries')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear loading spinner
                    queryHistoryContainer.innerHTML = '';
                    
                    if (data.queries.length === 0) {
                        queryHistoryContainer.innerHTML = '<p class="text-center text-muted">No query history yet. Start asking questions!</p>';
                        return;
                    }
                    
                    // Add each query to the history
                    data.queries.forEach(query => {
                        const template = document.getElementById('queryHistoryItemTemplate');
                        const clone = template.content.cloneNode(true);
                        
                        clone.querySelector('.query-text').textContent = query.query;
                        clone.querySelector('.query-time').textContent = query.timestamp;
                        
                        const button = clone.querySelector('.query-history-item');
                        button.addEventListener('click', function() {
                            executeHistoricalQuery(query.query);
                        });
                        
                        queryHistoryContainer.appendChild(clone);
                    });
                } else {
                    queryHistoryContainer.innerHTML = '<p class="text-center text-danger">Failed to load query history</p>';
                }
            })
            .catch(error => {
                console.error('Error loading query history:', error);
                queryHistoryContainer.innerHTML = '<p class="text-center text-danger">Error loading query history</p>';
            });
    }
    
    function executeHistoricalQuery(query) {
        // Set as current query
        window.sessionState.currentQuery = query;
        
        // Add to chat history UI
        addUserMessage(query);
        
        // Execute the query
        processQuery(query);
    }
    
    // Make these functions available globally
    window.loadQueryHistory = loadQueryHistory;
    window.executeHistoricalQuery = executeHistoricalQuery;
});
