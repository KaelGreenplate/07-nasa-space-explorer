// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
// IMPORTANT: Replace 'DEMO_KEY' with your actual NASA API Key if you have one!
// If you don't have one yet, 'DEMO_KEY' will work but has strict limits.
const NASA_API_KEY = 'YdWiKLbF7fGQqh1YDSTgXDUwPKR0llp67mMxEzab';
const APOD_API_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

// --- DOM Elements (Getting references to parts of your HTML) ---
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const getImageButton = document.getElementById('getImageBtn');
const galleryContainer = document.getElementById('imageGallery');
const loadingMessage = document.getElementById('loadingMessage'); // Make sure this element exists in index.html (we'll add it)

// --- Modal Elements (for the pop-up detailed view) ---
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModalBtn = document.querySelector('.close-button'); // The 'X' button

// --- Random Space Facts (for LevelUp) ---
const spaceFactElement = document.getElementById('spaceFact'); // We'll add this to index.html
const spaceFacts = [
    "Did you know? A 'light year' is the distance light travels in one year, about 6 trillion miles!",
    "Did you know? There are more stars in the universe than grains of sand on all the beaches on Earth.",
    "Did you know? The sunset on Mars appears blue.",
    "Did you know? One day on Venus is longer than one year on Venus!",
    "Did you know? The largest known star, UY Scuti, is so big it would engulf Jupiter's orbit.",
    "Did you know? There is a planet made of diamonds, named 55 Cancri e.",
    "Did you know? It rains diamonds on Saturn and Jupiter.",
    "Did you know? The observable universe is estimated to be 93 billion light-years in diameter."
];

// --- Event Listeners (Making buttons interactive) ---
getImageButton.addEventListener('click', fetchAPODData); // When the button is clicked, run fetchAPODData

// Close modal when 'X' is clicked
closeModalBtn.addEventListener('click', closeModal);
// Close modal when clicking outside the image content
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        closeModal();
    }
});

// --- Functions (The building blocks of our program) ---

// Function to fetch data from NASA API
async function fetchAPODData() {
    // Clear previous gallery content and hide it
    galleryContainer.innerHTML = '';
    galleryContainer.style.display = 'none';

    // Show loading message
    loadingMessage.textContent = '🔄 Loading space photos...';
    loadingMessage.style.display = 'block';

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Check if dates are selected
    if (!startDate || !endDate) {
        alert('Please select both a start and end date.');
        loadingMessage.style.display = 'none'; // Hide loading message if validation fails
        return;
    }

    try {
        // Construct the full API URL with date range
        const response = await fetch(`${APOD_API_URL}&start_date=${startDate}&end_date=${endDate}`);

        // Check if the network request was successful
        if (!response.ok) {
            // If not, throw an error with the status
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Convert the response to JSON format

        // Hide loading message
        loadingMessage.style.display = 'none';

        // Display the data in the gallery
        displayGallery(data);
        galleryContainer.style.display = 'grid'; // Show the gallery again

    } catch (error) {
        console.error('Error fetching APOD data:', error);
        loadingMessage.textContent = 'Error loading photos. Please try again later or check your API Key.';
        loadingMessage.style.color = 'red';
    }
}

// Function to display the fetched images in the gallery
function displayGallery(apodData) {
    galleryContainer.innerHTML = ''; // Clear previous images

    // Sort data by date from newest to oldest
    apodData.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (apodData.length === 0) {
        galleryContainer.innerHTML = '<p>No images found for the selected date range. Try a different range.</p>';
        return;
    }

    apodData.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item');

        const itemDate = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Handle different media types (images vs. videos - LevelUp)
        if (item.media_type === 'image') {
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.title;
            galleryItem.appendChild(img);
            // Add event listener to open modal on click
            galleryItem.addEventListener('click', () => openModal(item));

        } else if (item.media_type === 'video') {
            // Option 1: Display a clickable link to the video
            const videoLink = document.createElement('a');
            videoLink.href = item.url;
            videoLink.target = '_blank'; // Open in new tab
            videoLink.textContent = 'Click to Watch Video';
            videoLink.classList.add('video-link-thumbnail'); // Add class for styling
            galleryItem.appendChild(videoLink);

            const videoThumbnailText = document.createElement('p');
            videoThumbnailText.textContent = '(Video Entry)';
            videoThumbnailText.classList.add('video-thumbnail-text');
            galleryItem.appendChild(videoThumbnailText);

            // If you wanted to embed the video directly:
            // const iframe = document.createElement('iframe');
            // iframe.src = item.url.replace("http://", "https://"); // Ensure HTTPS
            // iframe.allowFullscreen = true;
            // iframe.classList.add('video-embed');
            // galleryItem.appendChild(iframe);

        } else {
            // For other unhandled media types
            const unsupportedMsg = document.createElement('p');
            unsupportedMsg.textContent = 'Unsupported media type: ' + item.media_type;
            unsupportedMsg.classList.add('unsupported-media-msg');
            galleryItem.appendChild(unsupportedMsg);
        }

        const title = document.createElement('h3');
        title.textContent = item.title;
        galleryItem.appendChild(title);

        const date = document.createElement('p');
        date.textContent = itemDate;
        galleryItem.appendChild(date);

        galleryContainer.appendChild(galleryItem);
    });
}

// Function to open the modal with full details
function openModal(item) {
    modalImage.src = item.url;
    modalImage.alt = item.title;
    modalTitle.textContent = item.title;
    modalDate.textContent = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    modalExplanation.textContent = item.explanation;
    modal.style.display = 'block'; // Show the modal
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none'; // Hide the modal
}

// Function to display a random space fact on page load (LevelUp)
function displayRandomSpaceFact() {
    const randomIndex = Math.floor(Math.random() * spaceFacts.length);
    spaceFactElement.textContent = spaceFacts[randomIndex];
}

// --- Initial Call (Run when the page loads) ---
document.addEventListener('DOMContentLoaded', () => {
    // This function from dateRange.js (provided starter file) sets up date inputs
    setupDateRangePicker();
    displayRandomSpaceFact(); // Show a random fact when the page loads
});