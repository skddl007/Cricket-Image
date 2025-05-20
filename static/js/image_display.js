/**
 * Image display functionality for the Cricket Image Chatbot
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to display an image card
    window.displayImageCard = function(container, image, index) {
        const template = document.getElementById('imageCardTemplate');
        const clone = template.content.cloneNode(true);
        
        // Set unique IDs for collapse elements
        const detailsButton = clone.querySelector('[data-bs-toggle="collapse"]');
        const detailsId = `image-details-${Date.now()}-${index}`;
        detailsButton.setAttribute('data-bs-target', `#${detailsId}`);
        
        const collapseDiv = clone.querySelector('.collapse');
        collapseDiv.id = detailsId;
        
        // Set caption if available
        if (image.metadata.caption) {
            clone.querySelector('.image-header').textContent = image.metadata.caption;
        } else {
            clone.querySelector('.image-header').style.display = 'none';
        }
        
        // Get the image URL
        let url = null;
        for (const urlKey of ['image_url', 'url', 'URL']) {
            if (image.metadata[urlKey]) {
                url = image.metadata[urlKey];
                break;
            }
        }
        
        if (!url) {
            // No URL found, display a message
            clone.querySelector('.image-container img').style.display = 'none';
            clone.querySelector('.image-error').classList.remove('d-none');
            clone.querySelector('.image-url').style.display = 'none';
        } else {
            // Set the image URL
            const imgElement = clone.querySelector('.image-container img');
            
            // Check if it's a Google Drive URL
            let fileId = null;
            if (url.includes('drive.google.com') && url.includes('/d/')) {
                try {
                    fileId = url.split('/d/')[1].split('/')[0];
                } catch (e) {
                    fileId = null;
                }
            }
            
            // Try different image sources
            let imageUrl = url;
            
            if (fileId) {
                // Try large thumbnail for Google Drive
                imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
                
                // Add alternative links
                const alternativeLinks = clone.querySelector('.alternative-links');
                alternativeLinks.innerHTML = `
                    <p><strong>Try these alternative links:</strong></p>
                    <ul>
                        <li><a href="https://drive.google.com/thumbnail?id=${fileId}&sz=w2000" target="_blank">Large Thumbnail</a></li>
                        <li><a href="https://drive.google.com/thumbnail?id=${fileId}&sz=w1000" target="_blank">Small Thumbnail</a></li>
                        <li><a href="https://drive.google.com/uc?export=view&id=${fileId}" target="_blank">Direct Link</a></li>
                        <li><a href="${url}" target="_blank">Open in Google Drive</a></li>
                        <li><a href="https://drive.google.com/file/d/${fileId}/preview" target="_blank">Preview in Google Drive</a></li>
                    </ul>
                `;
            }
            
            // Set the image source
            imgElement.src = imageUrl;
            imgElement.alt = image.metadata.caption || 'Cricket image';
            
            // Handle image load error
            imgElement.onerror = function() {
                if (fileId) {
                    // Try smaller thumbnail
                    this.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                    
                    // Handle second error
                    this.onerror = function() {
                        // Try direct URL
                        this.src = `https://drive.google.com/uc?export=view&id=${fileId}`;
                        
                        // Handle third error
                        this.onerror = function() {
                            // Show error message
                            this.style.display = 'none';
                            clone.querySelector('.image-error').classList.remove('d-none');
                        };
                    };
                } else {
                    // Show error message for non-Google Drive URLs
                    this.style.display = 'none';
                    clone.querySelector('.image-error').classList.remove('d-none');
                }
            };
            
            // Set the URL link
            const urlLink = clone.querySelector('.image-url a');
            urlLink.href = url;
            urlLink.textContent = url;
        }
        
        // Set player, event, and action information
        clone.querySelector('.player-name span').textContent = image.metadata.player_name || 'Unknown player';
        clone.querySelector('.event-name span').textContent = image.metadata.event_name || 'Unknown event';
        clone.querySelector('.action-name span').textContent = image.metadata.action_name || 'Unknown action';
        
        // Set up feedback buttons
        if (url && image.metadata.document_id) {
            const feedbackKey = `${window.sessionState.currentQuery}-${url}`;
            
            // Check if feedback has already been given
            if (window.sessionState.feedbackGiven.has(feedbackKey)) {
                clone.querySelector('.feedback-buttons').style.display = 'none';
                clone.querySelector('.feedback-message').classList.remove('d-none');
            } else {
                const positiveButton = clone.querySelector('.feedback-positive');
                const negativeButton = clone.querySelector('.feedback-negative');
                
                positiveButton.addEventListener('click', function() {
                    handleFeedback(image.metadata.document_id, url, 1);
                    
                    // Hide buttons and show thank you message
                    clone.querySelector('.feedback-buttons').style.display = 'none';
                    clone.querySelector('.feedback-message').classList.remove('d-none');
                    
                    // Add to feedback given set
                    window.sessionState.feedbackGiven.add(feedbackKey);
                });
                
                negativeButton.addEventListener('click', function() {
                    handleFeedback(image.metadata.document_id, url, -1);
                    
                    // Hide buttons and show thank you message
                    clone.querySelector('.feedback-buttons').style.display = 'none';
                    clone.querySelector('.feedback-message').classList.remove('d-none');
                    
                    // Add to feedback given set
                    window.sessionState.feedbackGiven.add(feedbackKey);
                });
            }
        } else {
            // No document ID or URL, hide feedback buttons
            clone.querySelector('.feedback-buttons').style.display = 'none';
        }
        
        // Set image details
        const importantFields = clone.querySelector('.important-fields');
        const allMetadata = clone.querySelector('.all-metadata');
        
        // Important fields
        const importantFieldsList = ['player_name', 'action_name', 'event_name', 'mood_name',
                                    'sublocation_name', 'timeofday', 'shot_type', 'focus'];
        
        importantFieldsList.forEach(field => {
            if (image.metadata[field]) {
                const fieldElement = document.createElement('p');
                fieldElement.innerHTML = `<strong>${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${image.metadata[field]}`;
                importantFields.appendChild(fieldElement);
            }
        });
        
        // All metadata
        for (const [key, value] of Object.entries(image.metadata)) {
            // Skip embedding field and already displayed important fields
            if (!value || key === 'embedding' || importantFieldsList.includes(key)) {
                continue;
            }
            
            // Skip ID fields that have corresponding name fields already displayed
            if (key === 'player_id' && image.metadata.player_name) continue;
            if (key === 'action_id' && image.metadata.action_name) continue;
            if (key === 'event_id' && image.metadata.event_name) continue;
            if (key === 'mood_id' && image.metadata.mood_name) continue;
            if (key === 'sublocation_id' && image.metadata.sublocation_name) continue;
            
            const metadataElement = document.createElement('p');
            metadataElement.innerHTML = `<strong>${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${value}`;
            allMetadata.appendChild(metadataElement);
        }
        
        // Add the card to the container
        container.appendChild(clone);
    };
    
    // Function to add similarity slider
    window.addSimilaritySlider = function(container, images) {
        const template = document.getElementById('similaritySliderTemplate');
        const clone = template.content.cloneNode(true);
        
        const slider = clone.querySelector('#similaritySlider');
        const thresholdValue = clone.querySelector('.threshold-value');
        
        // Set initial value
        slider.value = Math.round(window.sessionState.similarityThreshold * 100);
        thresholdValue.textContent = slider.value;
        
        // Add event listener
        slider.addEventListener('input', function() {
            thresholdValue.textContent = this.value;
            window.sessionState.similarityThreshold = this.value / 100;
            
            // Update displayed images based on threshold
            updateImagesBasedOnThreshold(container, images);
        });
        
        container.appendChild(clone);
    };
    
    // Function to add download button
    window.addDownloadButton = function(container, images) {
        const template = document.getElementById('downloadButtonTemplate');
        const clone = template.content.cloneNode(true);
        
        const downloadButton = clone.querySelector('.download-button');
        
        // Create text content
        let urlText = "Image URLs:\n\n";
        images.forEach((image, i) => {
            const imageUrl = image.metadata.url || 'No URL available';
            const playerName = image.metadata.player_name || 'Unknown player';
            const eventName = image.metadata.event_name || 'Unknown event';
            const actionName = image.metadata.action_name || 'Unknown action';
            urlText += `${i+1}. ${playerName} - ${actionName} at ${eventName}: ${imageUrl}\n`;
        });
        
        // Create a Blob and set as download URL
        const blob = new Blob([urlText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        downloadButton.href = url;
        
        container.appendChild(clone);
    };
    
    // Function to handle feedback
    window.handleFeedback = function(docId, imageUrl, rating) {
        fetch('/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                doc_id: docId,
                image_url: imageUrl,
                rating: rating,
                query: window.sessionState.currentQuery
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Feedback error:', data.message);
            }
        })
        .catch(error => {
            console.error('Feedback error:', error);
        });
    };
    
    // Function to update displayed images based on threshold
    function updateImagesBasedOnThreshold(container, images) {
        // Find the image grid
        const imageGrid = container.querySelector('.image-grid');
        if (!imageGrid) return;
        
        // Clear existing images
        imageGrid.innerHTML = '';
        
        // Filter images based on threshold
        const filteredImages = images.filter(image => 
            image.similarity_score >= window.sessionState.similarityThreshold
        );
        
        // Update header
        const header = container.querySelector('.similar-images-header');
        if (header) {
            if (filteredImages.length === 0) {
                header.textContent = `Please adjust the similarity threshold below ${Math.round(window.sessionState.similarityThreshold * 100)}% to see more images.`;
                return;
            }
            
            let displayMessage = `Showing All ${filteredImages.length} Matching Images`;
            
            // Add additional info for face detection if applicable
            if (filteredImages.some(img => img.metadata.no_of_faces !== undefined && parseInt(img.metadata.no_of_faces) >= 2)) {
                displayMessage += " (With Multiple Faces)";
            }
            
            // Add similarity threshold info
            displayMessage += ` (Similarity ≥ ${Math.round(window.sessionState.similarityThreshold * 100)}%)`;
            
            header.textContent = displayMessage;
        }
        
        // Add filtered images
        filteredImages.forEach((image, index) => {
            displayImageCard(imageGrid, image, index);
        });
    }
});
