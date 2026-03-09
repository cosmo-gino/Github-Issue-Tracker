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

// Show issues
function displayIssues() {
  issuesGrid.innerHTML = '';

  if (filteredIssues.length === 0) {
    issuesGrid.innerHTML = '<p>No issues found</p>';
    return;
  }

  filteredIssues.forEach(issue => {
    const card = createCard(issue);
    issuesGrid.appendChild(card);
  });
}

// Create issue card
function createCard(issue) {
  const card = document.createElement('div');
  card.className = 'card bg-white shadow-md rounded-lg overflow-hidden cursor-pointer';

  const isOpen = issue.status === 'open' || issue.state === 'open';
  const statusColor = isOpen ? '#10b981' : '#9333ea';
  const statusBg = isOpen ? '#d1fae5' : '#e9d5ff';
  const statusIcon = isOpen ? 'assets/open.svg' : 'assets/closed.svg';

  const priority = issue.priority || 'MEDIUM';
  let priorityBg = '#fef3c7';
  let priorityColor = '#f97316';
  if (priority === 'HIGH') {
    priorityBg = '#fce7f3';
    priorityColor = '#ec4899';
  } else if (priority === 'LOW') {
    priorityBg = '#e9d5ff';
    priorityColor = '#9333ea';
  }

  let labels = issue.labels || [];
  if (labels.length > 0 && typeof labels[0] === 'object') {
    labels = labels.map(l => l.name || l.label || '');
  }

  let labelsHtml = '';
  labels.forEach(label => {
    let labelBg = '#f3f4f6';
    let labelColor = '#6b7280';
    let icon = '';

    if (label.includes('BUG')) {
      labelBg = '#fce7f3';
      labelColor = '#ef4444';
      icon = '<img src="assets/bug.svg" class="w-4 h-4 inline mr-1" />';
    } else if (label.includes('HELP')) {
      labelBg = '#fef3c7';
      labelColor = '#f97316';
      icon = '<img src="assets/help_wanted.svg" class="w-4 h-4 inline mr-1" />';
    } else if (label.includes('ENHANCEMENT')) {
      labelBg = '#d1fae5';
      labelColor = '#10b981';
      icon = '<img src="assets/enhancement.svg" class="w-4 h-4 inline mr-1" />';
    }

    labelsHtml += `<span class="badge text-xs px-3 py-1 rounded-md" style="background-color: ${labelBg}; color: ${labelColor};">${icon}${label}</span>`;
  });

  const date = new Date(issue.created_at || issue.date);
  const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  card.innerHTML = `
    <div style="height: 4px; background-color: ${statusColor};"></div>
    <div class="card-body p-4">
      <div class="flex justify-between mb-2">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${statusBg};">
          <img src="${statusIcon}" class="w-5 h-5" />
        </div>
        <span class=" text-xs px-4 py-2 rounded-full" style="background-color: ${priorityBg}; color: ${priorityColor};">${priority}</span>
      </div>
      <h3 class="text-md text-black font-semibold mb-2">${issue.title || 'Untitled'}</h3>
      <p class="text-gray-600 text-sm mb-3">${issue.body || issue.description || 'No description'}</p>
      <div class="flex flex-wrap gap-2 mb-3">${labelsHtml}</div>
    </div>
    <div class="border-t border-gray-200 px-4 py-3">
      <div class="text-xs text-gray-500">
        <p>#${issue.number || issue.id} by ${issue.user?.login || issue.author || 'unknown'}</p>
        <p>${dateStr}</p>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    const issueId = issue.id || issue._id || issue.number;
    console.log('Issue object:', issue);
    console.log('Using ID:', issueId);
    if (issueId) {
      openModal(issueId);
    } else {
      alert('Issue ID not found');
    }
  });

  return card;
}

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      b.style.backgroundColor = '';
      b.style.color = '#4a5568';
      b.classList.add('btn-outline');
    });
    btn.style.backgroundColor = '#4A00FF';
    btn.style.color = 'white';
    btn.classList.remove('btn-outline');

    currentFilter = btn.getAttribute('data-filter');
    applyFilter();
  });
});

// Apply filter
function applyFilter() {
  issuesGrid.innerHTML = '';
  loadingSpinner.classList.remove('hidden');

  setTimeout(() => {
    if (currentFilter === 'all') {
      filteredIssues = allIssues;
    } else if (currentFilter === 'open') {
      filteredIssues = allIssues.filter(issue => issue.status === 'open' || issue.state === 'open');
    } else if (currentFilter === 'closed') {
      filteredIssues = allIssues.filter(issue => issue.status === 'closed' || issue.state === 'closed');
    }

    loadingSpinner.classList.add('hidden');
    displayIssues();
    updateCount();
  }, 300);
}

// Search function
function performSearch() {
  const searchText = searchInput.value.trim();

  if (searchText.length === 0) {
    filteredIssues = allIssues;
    applyFilter();
    return;
  }

  issuesGrid.innerHTML = '';
  loadingSpinner.classList.remove('hidden');

  const searchUrl = `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(searchText)}`;
  console.log('Searching:', searchUrl);

  fetch(searchUrl)
    .then(response => {
      console.log('Search response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Search response data:', data);

      let results = [];
      if (data.status === 'success' && data.data) {
        results = data.data;
      } else if (data.success && data.data) {
        results = data.data;
      } else if (Array.isArray(data)) {
        results = data;
      } else if (data.data && Array.isArray(data.data)) {
        results = data.data;
      }

      filteredIssues = results;
      loadingSpinner.classList.add('hidden');
      displayIssues();
      updateCount();
    })
    .catch(error => {
      console.error('Search error:', error);
      filteredIssues = [];
      loadingSpinner.classList.add('hidden');
      displayIssues();
      updateCount();
    });
}

// Search button click
searchBtn.addEventListener('click', performSearch);

// Search on Enter key
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

// Open modal
async function openModal(issueId) {
  loadingSpinner.classList.remove('hidden');

  try {
    const url = `${SINGLE_ISSUE_URL}/${issueId}`;
    console.log('Fetching issue from:', url);

    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to fetch issue');
    }

    const data = await response.json();
    console.log('API Response:', data);

    let issue = null;
    if ((data.status === 'success' || data.success) && data.data) {
      issue = data.data;
    } else if (data.id || data.number) {
      issue = data;
    } else if (Array.isArray(data) && data.length > 0) {
      issue = data[0];
    }

    console.log('Issue data:', issue);

    if (issue) {
      showModal(issue);
    } else {
      alert('Failed to load issue details. Check console for details.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error loading issue: ' + error.message);
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}
