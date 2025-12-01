// DOM Elements
const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const searchSelect = document.getElementById("search-select");
const searchResultInfos = document.getElementById("search-results-infos");

let allEpisodes = [];
let fetchFailed = false;

window.onload = setup;

async function setup() {
  showLoadingMessage();

  try {
    allEpisodes = await fetchEpisodes();
  } catch (err) {
    showErrorMessage("Failed to load episode data. Please try again later.");
    fetchFailed = true;
    return;
  }

  clearRoot();
  makePageForEpisodes(allEpisodes);
  populateSelect(allEpisodes);

  searchInput.addEventListener("input", handleSearch);
  searchSelect.addEventListener("change", handleSelect);
}

async function fetchEpisodes() {
  const url = "https://api.tvmaze.com/shows/82/episodes";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not OK");
  }

  const episodes = await response.json();
  return episodes;
}

function showLoadingMessage() {
  rootElem.innerHTML = `
    <p aria-live="polite">⏳ Loading episodes…</p>
  `;
}

function showErrorMessage(msg) {
  rootElem.innerHTML = `
    <p role="alert" style="color: #b00020; font-weight: bold;">
      ❌ ${msg}
    </p>
  `;
}

function clearRoot() {
  rootElem.innerHTML = "";
}

function makePageForEpisodes(episodeList) {
  clearRoot();

  episodeList.forEach((episode) => {
    const article = document.createElement("article");
    article.classList.add("episode");
    article.setAttribute("tabindex", "0");

    // Title
    const title = document.createElement("h2");
    const season = episode.season.toString().padStart(2, "0");
    const epNum = episode.number.toString().padStart(2, "0");
    title.textContent = `${episode.name} - S${season}E${epNum}`;
    article.appendChild(title);

    // Image
    if (episode.image && episode.image.medium) {
      const img = document.createElement("img");
      img.src = episode.image.medium;
      img.alt = `${episode.name} thumbnail`;
      article.appendChild(img);
    }

    // Summary
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;
    article.appendChild(summary);

    rootElem.appendChild(article);
  });

  // Footer
  const footer = document.createElement("footer");
  footer.innerHTML = `Data sourced from <a href="https://tvmaze.com/">TVMaze.com</a>`;
  rootElem.appendChild(footer);
}

function handleSearch() {
  if (fetchFailed) return; // avoid acting on error state

  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    searchResultInfos.innerHTML = "";
    makePageForEpisodes(allEpisodes);
    searchSelect.selectedIndex = 0;
    return;
  }

  const results = allEpisodes.filter(
    (ep) =>
      ep.name.toLowerCase().includes(query) ||
      ep.summary.toLowerCase().includes(query)
  );

  makePageForEpisodes(results);

  searchResultInfos.innerHTML =
    results.length > 0
      ? `"${query}" found in ${results.length} episode(s)`
      : `No results found for "${query}"`;

  searchSelect.selectedIndex = 0;
}

function handleSelect() {
  if (fetchFailed) return;

  const value = searchSelect.value;

  if (value === "Select an episode") {
    makePageForEpisodes(allEpisodes);
    searchInput.value = "";
    searchResultInfos.textContent = "";
    return;
  }

  const episode = allEpisodes.find((ep) => ep.name === value);

  if (episode) {
    makePageForEpisodes([episode]);
    searchResultInfos.textContent = "";
    searchInput.value = "";
  }
}

function populateSelect(episodes) {
  let html = `<option>Select an episode</option>`;

  episodes.forEach((ep) => {
    const id = `S${ep.season.toString().padStart(2, "0")}E${ep.number
      .toString()
      .padStart(2, "0")}`;

    html += `<option value="${ep.name}">${id} - ${ep.name}</option>`;
  });

  searchSelect.innerHTML = html;
}
