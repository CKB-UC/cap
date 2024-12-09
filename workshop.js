document.addEventListener('DOMContentLoaded', () => {
    // Category filter on category page
    document.querySelectorAll('.category').forEach(category => {
        category.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            const selectedCategory = event.target.getAttribute('data-category');

            document.querySelectorAll('.video-card').forEach(videoCard => {
                const videoCategory = videoCard.getAttribute('data-category');
                
                if (selectedCategory === "all" || selectedCategory === videoCategory) {
                    videoCard.style.visibility = 'visible';
                    videoCard.style.height = 'auto'; // Reset height
                } else {
                    videoCard.style.visibility = 'hidden';
                    videoCard.style.height = 0; // Keep layout intact
                }
            });
        });
    });

    // Category button click to navigate to video page
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function () {
            const selectedCategory = this.getAttribute('data-category');

            // Hide category page
            document.getElementById('category-page').style.display = 'none';
            
            // Show video page
            document.getElementById('video-page').style.display = 'block';

            // Show back to categories button
            document.getElementById('back-to-categories').style.display = 'inline-block';

            // Filter videos on video page
            document.querySelectorAll('.video-card').forEach(videoCard => {
                const videoCategory = videoCard.getAttribute('data-category');
                if (selectedCategory === 'all' || selectedCategory === videoCategory) {
                    videoCard.style.display = 'flex'; // Show matching videos
                } else {
                    videoCard.style.display = 'none'; // Hide non-matching videos
                }
            });
        });
    });

    // Back to Categories button functionality
    document.getElementById('back-to-categories').addEventListener('click', function () {
        // Hide video page
        document.getElementById('video-page').style.display = 'none';
        
        // Show category page
        document.getElementById('category-page').style.display = 'block';

        // Hide back to categories button
        document.getElementById('back-to-categories').style.display = 'none';
    });
});