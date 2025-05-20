/**
 * Chat functionality for the Cricket Image Chatbot
 */
document.addEventListener('DOMContentLoaded', function() {
    // Query form submission
    const queryForm = document.getElementById('queryForm');
    const queryInput = document.getElementById('queryInput');
    const chatHistory = document.getElementById('chatHistory');
    
    if (queryForm) {
        queryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = queryInput.value.trim();
            if (!query) return;
            
            // Store the current query
            window.sessionState.currentQuery = query;
            
            // Add user message to chat history
            addUserMessage(query);
            
            // Clear input
            queryInput.value = '';
            
            // Process the query
            processQuery(query);
        });
    }
    
    // Function to add user message to chat history
    window.addUserMessage = function(message) {
        const template = document.getElementById('userMessageTemplate');
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('p').textContent = message;
        
        chatHistory.appendChild(clone);
        
        // Scroll to bottom
        scrollToBottom();
    };
    
    // Function to add assistant message to chat history
    window.addAssistantMessage = function(responseText, similarImages, usedSimilarity) {
        const template = document.getElementById('assistantMessageTemplate');
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('p').textContent = responseText;
        
        const messageElement = clone.querySelector('.assistant-message');
        const similarImagesContainer = clone.querySelector('.similar-images-container');
        
        // Add the message to the chat history
        chatHistory.appendChild(clone);
        
        // If there are similar images, display them
        if (similarImages && similarImages.length > 0) {
            // Create a header for the images
            const header = document.createElement('h5');
            header.className = 'similar-images-header';
            
            // Determine if this is a query for multiple players together
            const queryLower = window.sessionState.currentQuery.toLowerCase();
            const isMultiplePlayersQuery = isQueryForMultiplePlayers(queryLower);
            
            // Filter images for "together" queries
            let filteredImages = similarImages;
            if (isMultiplePlayersQuery) {
                filteredImages = similarImages.filter(img => {
                    const noOfFaces = img.metadata.no_of_faces;
                    return noOfFaces !== undefined && parseInt(noOfFaces) >= 2;
                });
                
                // If filtering removed all images, show a message
                if (filteredImages.length === 0 && similarImages.length > 0) {
                    const infoMessage = document.createElement('div');
                    infoMessage.className = 'alert alert-info';
                    infoMessage.textContent = "Here are images related to your query. For images with multiple players in the same frame, please try a more specific query.";
                    similarImagesContainer.appendChild(infoMessage);
                    
                    // Use the original images
                    filteredImages = similarImages;
                }
            }
            
            // Create a header message
            const totalImages = filteredImages.length;
            let displayMessage = `Showing All ${totalImages} Matching Images`;
            
            // Add additional info for face detection if applicable
            if (filteredImages.some(img => img.metadata.no_of_faces !== undefined && parseInt(img.metadata.no_of_faces) >= 2)) {
                displayMessage += " (With Multiple Faces)";
            }
            
            // Add similarity threshold info if applicable
            if (usedSimilarity) {
                displayMessage += ` (Similarity ≥ ${Math.round(window.sessionState.similarityThreshold * 100)}%)`;
            }
            
            header.textContent = displayMessage;
            similarImagesContainer.appendChild(header);
            
            // Add similarity slider if similarity search was used
            if (usedSimilarity) {
                addSimilaritySlider(similarImagesContainer, filteredImages);
            }
            
            // Add download button for image URLs if there are many results
            if (totalImages > 5) {
                addDownloadButton(similarImagesContainer, filteredImages);
            }
            
            // Create a grid for the images
            const imageGrid = document.createElement('div');
            imageGrid.className = 'image-grid';
            similarImagesContainer.appendChild(imageGrid);
            
            // Add each image to the grid
            filteredImages.forEach((image, index) => {
                displayImageCard(imageGrid, image, index);
            });
        }
        
        // Scroll to bottom
        scrollToBottom();
    };
    
    // Function to process a query
    window.processQuery = function(query, forceSimilarity = false) {
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'assistant-message message';
        loadingIndicator.innerHTML = `
            <div class="message-content">
                <div class="d-flex align-items-center">
                    <span class="me-2">Thinking...</span>
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        `;
        chatHistory.appendChild(loadingIndicator);
        scrollToBottom();
        
        // Send query to API
        fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, force_similarity: forceSimilarity })
        })
        .then(response => response.json())
        .then(data => {
            // Remove loading indicator
            chatHistory.removeChild(loadingIndicator);
            
            if (data.success) {
                // Add assistant response to chat history
                addAssistantMessage(data.response_text, data.similar_images, data.used_similarity);
                
                // Store in session state
                window.sessionState.chatHistory.push({
                    role: 'assistant',
                    content: {
                        response_text: data.response_text,
                        similar_images: data.similar_images,
                        used_similarity: data.used_similarity
                    }
                });
                
                // If no direct results were found and it's not a tabular or counting response,
                // try similarity search as a fallback
                if (data.similar_images.length === 0 && 
                    !data.response_text.includes("No cricket images matching") &&
                    !isTabularResponse(data.response_text) && 
                    !isCountingResponse(data.response_text)) {
                    
                    // Add a message about searching for similar images
                    const infoMessage = document.createElement('div');
                    infoMessage.className = 'alert alert-info';
                    infoMessage.textContent = "Looking for similar images that might be relevant to your query...";
                    chatHistory.appendChild(infoMessage);
                    scrollToBottom();
                    
                    // Try with force_similarity=true
                    fetch('/api/query', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ query, force_similarity: true })
                    })
                    .then(response => response.json())
                    .then(fallbackData => {
                        if (fallbackData.success && fallbackData.similar_images.length > 0) {
                            // Remove the info message
                            chatHistory.removeChild(infoMessage);
                            
                            // Add success message
                            const successMessage = document.createElement('div');
                            successMessage.className = 'alert alert-success';
                            successMessage.textContent = "Found some similar images that might be relevant:";
                            chatHistory.appendChild(successMessage);
                            
                            // Add the fallback results
                            addAssistantMessage("Here are some images that might be relevant to your query:", 
                                               fallbackData.similar_images, 
                                               true);
                        } else {
                            // Update the info message
                            infoMessage.textContent = "Please try a different search term for cricket images.";
                        }
                    })
                    .catch(error => {
                        console.error('Fallback query error:', error);
                        infoMessage.textContent = "An error occurred while searching for similar images.";
                    });
                }
            } else {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'alert alert-danger';
                errorMessage.textContent = data.message || 'An error occurred while processing your query.';
                chatHistory.appendChild(errorMessage);
                scrollToBottom();
            }
        })
        .catch(error => {
            // Remove loading indicator
            chatHistory.removeChild(loadingIndicator);
            
            // Show error message
            console.error('Query error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.textContent = 'An error occurred while processing your query. Please try again.';
            chatHistory.appendChild(errorMessage);
            scrollToBottom();
        });
    };
    
    // Helper functions
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    function isTabularResponse(text) {
        return text.includes('| ') && text.includes(' |');
    }
    
    function isCountingResponse(text) {
        const countTerms = ['there are', 'found', 'count', 'total of'];
        return countTerms.some(term => text.toLowerCase().includes(term));
    }
    
    function isQueryForMultiplePlayers(queryLower) {
        const multiplePlayerTerms = ["and", "&", "with", "together", "same frame", "single frame", "standing together", "one frame"];
        return multiplePlayerTerms.some(term => queryLower.includes(term));
    }
});
