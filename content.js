class TimeMachine {
  constructor() {
    console.log("Thanks for using the TimeMachine! 🚀");
    console.log(
      "You can follow me on X at @annedevj and tag me on your first ever tweets!"
    );
    this.username = null;
    this.joinDate = null;
    this.createSidebar();
    this.createButtons();
  }

  getUsername() {
    console.log("get");
    if (this.username === undefined || this.username === null) {
      this.username = this.computeUsername();
    }
    return this.username;
  }

  getJoinDate() {
    if (this.joinDate === undefined || this.joinDate === null) {
      this.joinDate = this.computeJoinDate();
    }
    return this.joinDate;
  }

  computeUsername() {
    console.log("compute");
    const titleTag = document.querySelector("title");
    if (titleTag) {
      const titleText = titleTag.textContent;
      const matchProfile = titleText.match(/@(\w+)/);
      const matchSearch = titleText.match(/from:(\w+)\+since/);

      const match = matchProfile
        ? matchProfile[1]
        : matchSearch
        ? matchSearch[1]
        : null;

      if (match) {
        localStorage.setItem("username", match);
        return match;
      }
    }
    if (localStorage.getItem("username") !== null) {
      return localStorage.getItem("username");
    }

    const usernameData = document.querySelector("#profile-info");

    if (usernameData) {
      return usernameData.getAttribute("data-username");
    }
    return null; // Return null if no valid handle is found
  }

  computeJoinDate() {
    const joinDateElement = document.querySelector(
      'span[data-testid="UserJoinDate"]'
    );
    if (joinDateElement) {
      const joinDateText = joinDateElement.innerHTML;
      const match = joinDateText.match(/Joined (\w+) (\d{4})/);
      if (match) {
        const month = match[1];
        const year = match[2];
        const joinDate = dayjs(Date.parse(`${month} 1, ${year}`));
        localStorage.setItem("joinDate", joinDate);
        return joinDate;
      }
    }
    if (localStorage.getItem("joinDate") !== null) {
      return dayjs(localStorage.getItem("joinDate"));
    }
    return null;
  }

  constructSearchQuery(startDate, endDate) {
    const startDateString = startDate.format("YYYY-MM-DD");
    const endDateString = endDate.format("YYYY-MM-DD");
    const query = `from:${this.username}+since:${startDateString}+until:${endDateString}`;

    return `https://x.com/search?q=${encodeURIComponent(
      query
    )}&src=typed_query&f=live`;
  }

  getTimeFromNow(date) {
    const now = new Date();
    const diff = now.valueOf() - date.valueOf();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.4375);
    const years = Math.floor(days / 365.25);

    if (seconds < 60) {
      return `${seconds} seconds ago`;
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else if (weeks < 4) {
      return `${weeks} weeks ago`;
    } else if (months < 12) {
      return `${months} months ago`;
    } else {
      return `${years} years ago`;
    }
  }

  toggleSidebar() {
    const isSidebarOpen = localStorage.getItem("sidebarOpen") === "true";

    const isSearchOrProfilePage =
      window.location.pathname === "/search" || this.getUsername() !== null;

    if (isSidebarOpen && isSearchOrProfilePage) {
      this.sidebar.style.display = "block";
      this.openButton.style.display = "none";
      this.closeButton.style.display = "block";
    } else {
      this.sidebar.style.display = "none";
      this.openButton.style.display = "block";
      this.closeButton.style.display = "none";
    }

    this.addInfoToSidebar();
  }

  createSidebar() {
    const sidebar = document.createElement("div");
    sidebar.id = "first-tweet-sidebar";
    sidebar.innerHTML =
      '<div class="header-container"><h2 id="main-header">Welcome to the time machine!</h2><div id="profile-info"></div></div><div id="first-tweet-content"></div>';
    document.body.appendChild(sidebar);
    this.sidebar = sidebar;

    const sidebarContent = document.getElementById("first-tweet-content");
    this.sidebarContent = sidebarContent;
  }

  createButtons() {
    const button = document.createElement("button");
    button.id = "first-tweet-button";
    button.textContent = "Time Machine ⏳";
    document.body.appendChild(button);
    this.openButton = button;

    const closeButton = document.createElement("button");
    closeButton.id = "close-button";
    closeButton.textContent = "X";
    document.body.appendChild(closeButton);
    this.closeButton = closeButton;

    button.addEventListener("click", async () => {
      localStorage.setItem("sidebarOpen", true);
      this.toggleSidebar();
    });

    closeButton.addEventListener("click", () => {
      localStorage.setItem("sidebarOpen", false);
      this.toggleSidebar();
    });

    this.toggleSidebar();
  }

  addInfoToSidebar() {
    this.appendProfileInfo();
    this.fillSearchRanges();
    this.fillSearchMonths();
  }

  appendProfileInfo() {
    if (this.profileInfo === true) {
      return;
    }

    const targetElement = document.getElementById("profile-info");

    if (!this.username || !this.joinDate) {
      targetElement.textContent =
        "Unable to find a username or join date. Make sure you're on a profile page and try again.";
      this.profileInfo = false;
    } else {
      targetElement.dataset.username = this.username;
      targetElement.innerHTML = `<p>@${
        this.username
      }</p><p>Joined ${this.getTimeFromNow(this.joinDate)}</p>`;
      this.profileInfo = true;
    }

    if (this.resetProfileButton) {
      this.resetProfileButton.remove();
      this.resetProfileButton = null;
    }

    const resetProfileButton = document.createElement("button");
    resetProfileButton.id = "reset-button";
    resetProfileButton.textContent = "Fetch profile again";
    targetElement.insertAdjacentElement("afterend", resetProfileButton);

    resetProfileButton.addEventListener("click", (e) => {
      e.preventDefault();
      resetProfileButton.textContent = "Fetched!";
      setTimeout(() => {
        resetProfileButton.textContent = "Fetch profile again";
      }, 2000);
      this.reset();
    });

    this.resetProfileButton = resetProfileButton;
  }

  fillSearchRanges() {
    if (this.searchRangesOptions || this.profileInfo === false) {
      return;
    }

    const searchRangesOptionsData = [
      { months: 1, name: "First month" },
      { months: 3, name: "First 3 months" },
      { months: 6, name: "First 6 months" },
      { months: 12, name: "First year" },
      { months: 24, name: "First 2 years" },
      { months: 36, name: "First 3 years" },
      { months: 60, name: "First 5 years" },
      { months: null, name: "All time" },
    ];

    const searchRangesOptions = document.createElement("div");
    searchRangesOptions.id = "search-ranges";
    this.sidebarContent.appendChild(searchRangesOptions);
    this.searchRangesOptions = searchRangesOptions;

    this.searchRangesOptions.innerHTML +=
      '<h3 class="header">Choose a time range to view tweets from:</h3>';

    this.searchRangesOptions.innerHTML += `
    <div class="search-ranges">
      <ul id="search-ranges-list">
        ${searchRangesOptionsData
          .map((range) => {
            let months = range.months;
            let endDate = months
              ? this.joinDate.add(parseInt(months), "month")
              : dayjs();

            if (endDate.isAfter(dayjs())) {
              return;
            }
            let url = this.constructSearchQuery(this.joinDate, endDate);
            let activeLink = url === window.location.href ? "active" : "";

            return `
          <li>
            <a href="${url}" class="range-link ${activeLink}" data-months="${range.months}">${range.name}</a>
          </li>
        `;
          })
          .join("")}
      </ul>
    </div>
  `;

    // Add event listeners to range links
    document.querySelectorAll(".range-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = e.target.href;
      });
    });
  }

  fillSearchMonths() {
    if (this.searchMonthsOptions || this.profileInfo === false) {
      return;
    }

    const searchMonthsOptions = document.createElement("div");
    searchMonthsOptions.id = "search-months";
    this.sidebarContent.appendChild(searchMonthsOptions);
    this.searchMonthsOptions = searchMonthsOptions;

    const currentYear = dayjs().year();
    const joinYear = this.joinDate.get("year");
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

    this.searchMonthsOptions.innerHTML +=
      '<h3 class="header">Or pick a month to search for tweets from that month:</h3>';

    let yearsHtml = "";
    for (let year = joinYear; year <= currentYear; year++) {
      let monthsHtml = monthNames
        .map((name, index) => {
          let startMonth = dayjs(`${year}-${index + 1}-01`);
          let endMonth = startMonth.endOf("month");
          const url = this.constructSearchQuery(startMonth, endMonth);

          return `<li class="month"><a href="${url}" data-year="${year}" data-month="${index}">${name}</a></li>`;
        })
        .join("");
      yearsHtml += `
    <div>
      <div class="year-header">${year}</div>
      <ul class="months" data-year="${year}">
        ${monthsHtml}
      </ul>
    </div>
  `;
    }
    this.searchMonthsOptions.innerHTML += yearsHtml;

    const yearHeaders = document.querySelectorAll(".year-header");
    const monthDivs = document.querySelectorAll(".months");

    monthDivs.forEach((div) => {
      div.style.display = "none";
    });

    yearHeaders.forEach((header) => {
      header.addEventListener("click", (_e) => {
        const monthDiv = header.nextElementSibling;

        monthDivs.forEach((div) => {
          if (div !== monthDiv) {
            div.style.display = "none";
          }
        });

        monthDiv.style.display =
          monthDiv.style.display === "block" ? "none" : "block";
      });
    });

    setTimeout(() => {
      this.openActiveYear(monthDivs);
    }, 400);
  }

  openActiveYear(monthDivs) {
    let activeSearchYear = null;
    const titleTag = document.querySelector("title");
    if (titleTag) {
      const titleText = titleTag.textContent;
      const matchSearch = titleText.match(/since:(\d{4})\S+until:(\d{4})/);
      if (matchSearch && matchSearch[1] === matchSearch[2]) {
        activeSearchYear = matchSearch[1];
      }
    }

    const matchingDiv = Array.from(monthDivs).find(
      (div) => div.dataset.year === activeSearchYear
    );

    if (activeSearchYear && matchingDiv) {
      matchingDiv.style.display = "block";
    }
  }

  reset() {
    localStorage.removeItem("username");
    localStorage.removeItem("joinDate");
    this.profileInfo = null;
    this.username = null;
    this.joinDate = null;
    this.getUsername();
    this.getJoinDate();
    if (this.searchRangesOptions) {
      this.searchRangesOptions.remove();
    }
    this.searchRangesOptions = null;
    if (this.searchMonthsOptions) {
      this.searchMonthsOptions.remove();
    }
    this.searchMonthsOptions = null;
    this.addInfoToSidebar();
  }
}

function init() {
  const timeMachine = new TimeMachine();
  timeMachine.getUsername();
  timeMachine.getJoinDate();
  timeMachine.addInfoToSidebar();
}

// Run initialization when the page is fully loaded
window.addEventListener("load", init);
