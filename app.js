// app.js

// Page loader with a simple fade effect
function loadPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      if (page.id === pageId) {
        page.classList.add('active');
        if (pageId === "page-blacklist") {
          updateBlacklistPage();
        }
      } else {
        page.classList.remove('active');
      }
    });
  }
  
  // Attach click events to sidebar menu items
  document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.addEventListener('click', function() {
      const pageId = this.getAttribute('data-page');
      loadPage(pageId);
    });
  });
  
  // Calculate last 7 days' dates as labels
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString());
  }
  
  // Initialize "Weekly Visit Report" chart (Bar Chart) using dynamic date labels
  const ctxVisit = document.getElementById('visitChart').getContext('2d');
  const visitChart = new Chart(ctxVisit, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Visits',
        data: [10, 20, 5, 15, 12, 8, 17],  // Replace with your data source if needed
        backgroundColor: 'rgba(128, 0, 128, 0.7)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
  
  // Initialize "Checkout Summary" chart (Doughnut Chart)
  const ctxCheckout = document.getElementById('checkoutChart').getContext('2d');
  const checkoutChart = new Chart(ctxCheckout, {
    type: 'doughnut',
    data: {
      labels: ['Check In', 'Check Out'],
      datasets: [{
        data: [50, 50],
        backgroundColor: ['#4e73df', '#1cc88a']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  
  // In-memory array to simulate visitor data
  const visitors = [];
  
  // Helper function to mask NRIC (show only last 4 characters)
  function maskNRIC(nric) {
    return "*".repeat(nric.length - 4) + nric.slice(-4);
  }
  
  // Register visitor (Check In)
  function registerVisitor(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const passNumber = document.getElementById('regPass').value;
    const company = document.getElementById('regCompany').value;
    const nric = document.getElementById('regNRIC').value;
    const host = document.getElementById('regHost').value;
    const location = document.getElementById('regLocation').value;
    const blacklist = document.getElementById('regBlacklist').value; // "0" or "1"
    const notes = document.getElementById('regNotes').value;
    const timeIn = new Date();
  
    // Validate NRIC (supports S, T, F, G, and M)
    if (!validateNRIC(nric)) {
      alert("Invalid NRIC!");
      return;
    }
    
    // Prevent duplicate NRIC entries
    if (visitors.some(v => v.nric === nric)) {
      alert("Visitor with this NRIC is already registered.");
      return;
    }
    
    const visitor = { name, passNumber, company, nric, host, location, notes, blacklist, timeIn };
    visitors.push(visitor);
    
    if (notes.trim() !== "") {
      alert("Note: This profile includes additional remarks.");
    }
    alert("Visitor registered successfully!");
    document.getElementById('registrationForm').reset();
  }
  
  // Search data (for both Check In Report and Summary Report)
  function searchData(event) {
    event.preventDefault();
    let searchName, searchPass, searchCompany, resultsContainer;
    if (event.target.id === "searchForm") {
      searchName = document.getElementById('searchName').value.toLowerCase();
      searchPass = document.getElementById('searchPass').value.toLowerCase();
      searchCompany = document.getElementById('searchCompany').value.toLowerCase();
      resultsContainer = document.getElementById('searchResults');
    } else {
      searchName = document.getElementById('searchNameSummary').value.toLowerCase();
      searchPass = document.getElementById('searchPassSummary').value.toLowerCase();
      searchCompany = document.getElementById('searchCompanySummary').value.toLowerCase();
      resultsContainer = document.getElementById('searchResultsSummary');
    }
    const results = visitors.filter(visitor => {
      return (
        visitor.name.toLowerCase().includes(searchName) &&
        visitor.passNumber.toLowerCase().includes(searchPass) &&
        visitor.company.toLowerCase().includes(searchCompany)
      );
    });
    displaySearchResults(results, resultsContainer);
  }
  
  // Display search results in a table with additional columns
  function displaySearchResults(results, container) {
    container.innerHTML = "";
    if (results.length === 0) {
      container.innerHTML = "<p>No matching visitors found.</p>";
      return;
    }
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    ["Name", "Pass Number", "Company", "NRIC", "Host", "Location", "Time-In", "Remarks", "Blacklist"].forEach(headerText => {
      const th = document.createElement("th");
      th.innerText = headerText;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
    
    results.forEach(visitor => {
      const row = document.createElement("tr");
      const maskedNRIC = maskNRIC(visitor.nric);
      const blacklistIndicator = visitor.blacklist === "1" ? '<span class="blacklisted">●</span>' : '<span class="not-blacklisted">●</span>';
      row.innerHTML = `
        <td>${visitor.name}</td>
        <td>${visitor.passNumber}</td>
        <td>${visitor.company}</td>
        <td>${maskedNRIC}</td>
        <td>${visitor.host}</td>
        <td>${visitor.location}</td>
        <td>${new Date(visitor.timeIn).toLocaleString()}</td>
        <td>${visitor.notes}</td>
        <td>${blacklistIndicator}</td>
      `;
      table.appendChild(row);
    });
    container.appendChild(table);
  }
  
  // Extract data (simulate CSV export)
  function extractData() {
    if (visitors.length === 0) {
      alert("No visitor data to extract.");
      return;
    }
    let csv = "Name,Pass Number,Company,NRIC,Host,Location,Time-In,Remarks,Blacklist\r\n";
    visitors.forEach(visitor => {
      csv += `"${visitor.name}","${visitor.passNumber}","${visitor.company}","${visitor.nric}","${visitor.host}","${visitor.location}","${new Date(visitor.timeIn).toLocaleString()}","${visitor.notes}","${visitor.blacklist}"\r\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "visitor_data.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Checkout function: Alert if duration exceeds 12 hours from Time-In
  function checkoutVisitor(visitor) {
    const now = new Date();
    const timeIn = new Date(visitor.timeIn);
    const durationHours = (now - timeIn) / (1000 * 60 * 60);
    if (durationHours > 12) {
      alert("Alert: This visitor's duration exceeds 12 hours from Time-In.");
    }
  }
  
  // Update the Blacklist page with only blacklisted visitors
  function updateBlacklistPage() {
    const blacklistVisitors = visitors.filter(v => v.blacklist === "1");
    const container = document.getElementById("blacklistResults");
    displaySearchResults(blacklistVisitors, container);
  }
  