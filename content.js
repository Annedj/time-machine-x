function createSidebar() {
  // Create and inject the sidebar
  const sidebar = document.createElement("div");
  sidebar.id = "first-tweet-sidebar";
  sidebar.innerHTML =
    '<h2>Click on a range to search for tweets from that time period</h2><div id="first-tweet-content"></div>';
  document.body.appendChild(sidebar);
  // Open sidebar if localStorage open value is true and if url is /search
  localStorage.getItem("sidebarOpen") === "true" &&
  window.location.pathname === "/search"
    ? (sidebar.style.display = "block")
    : (sidebar.style.display = "none");
}

// Toggle sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById("first-tweet-sidebar");
  if (sidebar.style.display === "block") {
    sidebar.style.display = "none";
    localStorage.setItem("sidebarOpen", "false");
  } else {
    sidebar.style.display = "block";
    localStorage.setItem("sidebarOpen", "true");
  }
}

function fillSidebarWithYearAndMonthNames() {
  const username = getUsername();
  const joinDate = getJoinDate();
  const sidebarContent = document.getElementById("first-tweet-content");

  const currentYear = dayjs().year();
  const joinYear = joinDate.get("year");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let yearsHtml = "";
  for (let year = joinYear; year <= currentYear; year++) {
    let monthsHtml = monthNames
      .map((name, index) => {
        let startMonth = dayjs(`${year}-${index + 1}-01`);
        let endMonth = startMonth.endOf("month");
        const url = constructSearchQuery(startMonth, endMonth);

        return `<li class="month" ><a href="${url}" data-year="${year}" data-month="${index}">${name}</a></li>`;
      })
      .join("");
    yearsHtml += `
    <div class="year" data-year="${year}">
      <div class=" header year-header">${year}</div>
      <ul class="months" style="display: none;">
        ${monthsHtml}
      </ul>
    </div>
  `;
  }
  sidebarContent.innerHTML = yearsHtml;
}

function addEventListenersOnYearAndMonthNames() {
  const yearHeaders = document.querySelectorAll(".year-header");
  const monthDivs = document.querySelectorAll(".months");

  // Add event listeners for collapsing functionality
  yearHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const monthDiv = header.nextElementSibling;

      monthDivs.forEach((div) => {
        if (div !== monthDiv) {
          div.style.display = "none";
        } else if (monthDiv.style.display === "block") {
          div.style.display = "none";
        } else {
          div.style.display = "block";
        }
      });
    });
  });
}

function fillSidebarWithTimeRanges() {
  const joinDate = getJoinDate();
  const sidebarContent = document.getElementById("first-tweet-content");

  const searchRanges = [
    { months: 1, name: "First month" },
    { months: 3, name: "First 3 months" },
    { months: 6, name: "First 6 months" },
    { months: 12, name: "First year" },
    { months: 24, name: "First 2 years" },
    { months: 36, name: "First 3 years" },
    { months: 60, name: "First 5 years" },
    { months: null, name: "All time" },
  ];

  sidebarContent.innerHTML += `
    <div class="search-ranges">
      <div class="header">By period</div>
      <ul id="search-ranges-list">
      </ul>
    </div>
  `;

  const ulElement = document.getElementById("search-ranges-list");

  searchRanges.forEach((range) => {
    const link = document.createElement("a");
    link.classList = link.textContent = range.name;
    link.dataset.months = range.months; // Store the months value in a data attribute

    console.log("🚀 ~ range.months:", range.months);
    if (range.months === null) {
      endDate = dayjs();
    } else {
      endDate = joinDate.add(range.months, "month");
    }

    const url = constructSearchQuery(joinDate, endDate);

    link.href = url;

    const liElement = document.createElement("li");
    liElement.appendChild(link);

    ulElement.appendChild(liElement);
  });
}

function createLiMonthLink(year, month) {}

// Get username from the title tag
function getUsername() {
  const titleTag = document.querySelector("title");
  if (titleTag) {
    const titleText = titleTag.textContent;
    const match = titleText.match(/@(\w+)/);

    if (match && match[1]) {
      localStorage.setItem("username", match[1]);
      return match[1];
    } else if (localStorage.getItem("username") !== null) {
      return localStorage.getItem("username");
    }
  }
  return null; // Return null if no valid handle is found
}

// Get join date from the profile page
function getJoinDate() {
  const joinDateElement = document.querySelector(
    'span[data-testid="UserJoinDate"]'
  );
  if (joinDateElement) {
    const joinDateText = joinDateElement.textContent;
    const match = joinDateText.match(/Joined (\w+) (\d{4})/);
    if (match) {
      const month = match[1];
      const year = match[2];
      const joinDate = dayjs(Date.parse(`${month} 1, ${year}`));
      localStorage.setItem("joinDate", joinDate);
      return joinDate;
    }
  } else if (localStorage.getItem("joinDate") !== null) {
    return dayjs(localStorage.getItem("joinDate"));
  }
  return null;
}

// Main function to find first tweet
function findFirstTweet() {
  const username = getUsername();
  const joinDate = getJoinDate();
  console.log("🚀 ~ username:", username);
  console.log("🚀 ~ joinDate:", joinDate);

  if (username && joinDate) {
    const sidebarContent = document.getElementById("first-tweet-content");
    // sidebarContent.textContent = "Searching for first tweet...";

    // chrome.runtime.sendMessage(
    //   {
    //     action: "startSearch",
    //     username: username,
    //     joinDate: joinDate.toISOString(),
    //     additionalInfo: "Some additional info", // Add any additional info here
    //   },
    //   (response) => {
    //     console.log("Response from background script:", response);
    //   }
    // );
  } else {
    alert(
      "Unable to find username or join date. Make sure you're on a Twitter profile page."
    );
  }
}

function constructUrlSearchQuery(startDate, endDate) {
  const username = getUsername();

  const startDateString = startDate.format("YYYY-MM-DD");
  const endDateString = endDate.format("YYYY-MM-DD");
  const query = `from:${username} since:${startDateString} until:${endDateString}`;

  return `https://x.com/search?q=${encodeURIComponent(
    query
  )}&src=typed_query&f=live`;
}

// Create and inject the button
async function createButtonAndCloseButton() {
  const button = document.createElement("button");
  button.id = "first-tweet-button";
  button.textContent = "X Time Machine ⏳";
  button.addEventListener("click", () => {
    toggleSidebar();
    fillSidebarWithYearAndMonthNames();
    fillSidebarWithTimeRanges();
    findFirstTweet();
    button.style.display = "none";
    closeButton.style.display = "block";
  });
  document.body.appendChild(button);

  const closeButton = document.createElement("button");
  closeButton.id = "close-button";
  closeButton.textContent = "X";
  closeButton.addEventListener("click", () => {
    toggleSidebar();
    button.style.display = "block";
    closeButton.style.display = "none";
  });
  document.body.appendChild(closeButton);
}

// Initialize extension
async function init() {
  createSidebar();
  createButtonAndCloseButton();
}

// Run initialization when the page is fully loaded
window.addEventListener("load", init);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "searchComplete") {
    const sidebarContent = document.getElementById("first-tweet-content");
    sidebarContent.textContent = message.result;
  }
});
