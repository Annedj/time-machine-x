let searchTabId = null;
let currentSearchIndex = 0;
let username = "";
let joinDate = null;

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);
  if (message.action === "startSearch") {
    console.log(
      "Starting search for user:",
      message.username,
      "with join date:",
      message.joinDate
    );

    username = message.username;
    joinDate = new Date(message.joinDate);
    currentSearchIndex = 0;
    searchTabId = sender.tab.id; // ici
    console.log("🚀 ~ searchTabId:", searchTabId);
    // performNextSearch();
  }
});

function performNextSearch() {
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

  if (currentSearchIndex >= searchRanges.length) {
    chrome.tabs.sendMessage(searchTabId, {
      action: "searchComplete",
      result: "No tweets found",
    });
    return;
  }

  const range = searchRanges[currentSearchIndex];
  const startDate = new Date(joinDate);
  let endDate;
  if (range.months === null) {
    endDate = new Date();
  } else {
    endDate = new Date(joinDate);
    endDate.setMonth(endDate.getMonth() + range.months);
  }

  const query = constructSearchQuery(username, startDate, endDate);
  const url = `https://twitter.com/search?q=${encodeURIComponent(
    query
  )}&src=typed_query&f=live`;

  if (searchTabId === null) {
    chrome.tabs.create({ url: url }, (tab) => {
      searchTabId = tab.id;
    });
  } else {
    chrome.tabs.update(searchTabId, { url: url });
  }
}

function constructSearchQuery(username, startDate, endDate) {
  const startDateString = startDate.toISOString().split("T")[0];
  const endDateString = endDate.toISOString().split("T")[0];
  return `from:${username} since:${startDateString} until:${endDateString}`;
}

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.tabId === searchTabId) {
      chrome.scripting.executeScript({
        target: { tabId: searchTabId },
        function: checkForTweets,
      });
    }
  },
  { url: [{ hostEquals: "twitter.com", pathContains: "/search" }] }
);

function checkForTweets() {
  const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
  if (tweetElements.length > 0) {
    chrome.runtime.sendMessage({
      action: "tweetsFound",
      range: currentSearchIndex,
    });
  } else {
    chrome.runtime.sendMessage({ action: "noTweetsFound" });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "noTweetsFound") {
    currentSearchIndex++;
    performNextSearch();
  } else if (message.action === "tweetsFound") {
    const searchRanges = [
      "First month",
      "First 3 months",
      "First 6 months",
      "First year",
      "First 2 years",
      "First 3 years",
      "First 5 years",
      "All time",
    ];
    const result = `First tweet found within ${
      searchRanges[message.range]
    } after joining.`;
    chrome.tabs.sendMessage(searchTabId, {
      action: "searchComplete",
      result: result,
    });
  }
});