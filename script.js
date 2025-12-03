import { populateShowSelect, makePageForShows } from "./includes/shows.js";
// DOM Elements
const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const showSelect = document.getElementById("shows-select");
const episodeSelect = document.getElementById("episodes-select");
const searchResultInfos = document.getElementById("search-results-infos");

let allEpisodes = [];
let allShows = [];
/*
 * During one user's visit to your website
 * you should never fetch any URL more than once.
 */
let seenShows = [];
let fetchFailed = false;

window.onload = setup;

async function setup() {
  try {
    allShows = await fetchData();
    console.log();
  } catch (err) {
    showErrorMessage("Failed to load episode data. Please try again later.");
    fetchFailed = true;
    return;
  }
  clearRoot();
  populateShowSelect(showSelect, allShows);
  makePageForShows(rootElem, allShows);
  setListeners();
}

// Show series.
async function fetchData(str) {
  const url = str || "https://api.tvmaze.com/shows";
  showLoadingMessage();
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Network response was not OK");
  }
  return await response.json();
}

function setListeners() {
  // Shows select.
  showSelect.addEventListener("change", handleShowSelectChange);
  // Input text.
  searchInput.addEventListener("input", handleSearch);
  // Episodes select.
  episodeSelect.addEventListener("change", handleEpisodeSelectChange);
}

// Events handlers.
async function handleShowSelectChange() {
  // Empty episodes filters.
  episodeSelect.selectedIndex = 0;
  searchInput.value = "";
  searchResultInfos.textContent = "";

  const id = this.value;
  // Case of default value.
  if (isNaN(id)) {
    clearRoot();
    makePageForShows(rootElem, allShows);
    return;
  }

  /*
   * During one user's visit to your website
   * you should never fetch any URL more than once.
   */
  if (seenShows.some((item) => item === id)) {
    showErrorMessage("You already fetched this show");

    return;
  }

  const url = `https://api.tvmaze.com/shows/${id}/episodes`;

  try {
    allEpisodes = await fetchData(url);
  } catch (err) {
    showErrorMessage("Failed to load episode data. Please try again later.");
    fetchFailed = true;
    return;
  }
  seenShows.push(id);
  clearRoot();
  makePageForEpisodes(allEpisodes);
  populateEpisodeSelect(allEpisodes);
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
}

function handleSearch() {
  if (fetchFailed) return; // avoid acting on error state

  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    searchResultInfos.innerHTML = "";
    makePageForEpisodes(allEpisodes);
    episodeSelect.selectedIndex = 0;
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

  episodeSelect.selectedIndex = 0;
}

function handleEpisodeSelectChange() {
  if (fetchFailed) return;

  const value = episodeSelect.value;

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

function populateEpisodeSelect(episodes) {
  let html = `<option>Select an episode</option>`;

  episodes.forEach((ep) => {
    const id = `S${ep.season.toString().padStart(2, "0")}E${ep.number
      .toString()
      .padStart(2, "0")}`;

    html += `<option value="${ep.name}">${id} - ${ep.name}</option>`;
  });

  episodeSelect.innerHTML = html;
}
