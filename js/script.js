// API URLs
const API_URL = 'https://phi-lab-server.vercel.app/api/v1/lab/issues';
const SINGLE_ISSUE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab/issue';


if (sessionStorage.getItem('isAuthenticated') !== 'true') {
  window.location.href = 'login.html';
}

// Variables
let allIssues = [];
let filteredIssues = [];
let currentFilter = 'all';

// Get elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const issuesGrid = document.getElementById('issuesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const filterButtons = document.querySelectorAll('.filter-btn');
const issueModal = document.getElementById('issueModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const issuesCount = document.getElementById('issuesCount');

// Load issues when page loads
loadIssues();

// Load all issues
async function loadIssues() {
  loadingSpinner.classList.remove('hidden');

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.success && data.data) {
      allIssues = data.data;
    } else if (Array.isArray(data)) {
      allIssues = data;
    } else if (data.data && Array.isArray(data.data)) {
      allIssues = data.data;
    } else {
      allIssues = [];
    }

    filteredIssues = allIssues;
    displayIssues();
    updateCount();
  } catch (error) {
    console.error('Error:', error);
    issuesGrid.innerHTML = '<p>Error loading issues</p>';
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}
