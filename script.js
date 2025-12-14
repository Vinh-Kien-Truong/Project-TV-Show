import { populateShowSelect } from "./includes/shows.js";
// DOM Elements

const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const showSelect = document.getElementById("shows-select");
const episodeSelect = document.getElementById("episodes-select");
const searchResultInfos = document.getElementById("search-results-infos");

let allEpisodes = [];
let allShows = [];
let showsCache = {};
let episodesCache = {};
let fetchFailed = false;
let currentView = "shows"; // "shows" or "episodes"

window.onload = setup;

async function setup() {
  try {
    allShows = await fetchShows();
  } catch (err) {
    showErrorMessage("Failed to load show data. Please try again later.");
    fetchFailed = true;
    return;
  }
  clearRoot();
  populateShowSelect(showSelect, allShows);
  makePageForShows(allShows);
  setListeners();
}

// Fetch all shows, cache result
async function fetchShows() {
  if (showsCache["all"]) return showsCache["all"];
  showLoadingMessage();
  const url = "https://api.tvmaze.com/shows";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not OK");
  const data = await response.json();
  showsCache["all"] = data;
  return data;
}

// Fetch episodes for a show, cache result
async function fetchEpisodes(showId) {
  if (episodesCache[showId]) return episodesCache[showId];
  showLoadingMessage();
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not OK");
  const data = await response.json();
  episodesCache[showId] = data;
  return data;
}

function setListeners() {
  // Shows select.
  showSelect.addEventListener("change", handleShowSelectChange);
  // Input text.
  searchInput.addEventListener("input", handleSearch);
  // Episodes select.
  episodeSelect.addEventListener("change", handleEpisodeSelectChange);
}

// Handle show select dropdown change
async function handleShowSelectChange() {
  episodeSelect.selectedIndex = 0;
  searchInput.value = "";
  searchResultInfos.textContent = "";
  const id = this.value;
  if (isNaN(id)) {
    showShowsView();
    return;
  }
  await showEpisodesView(id);
}

function showLoadingMessage() {
  rootElem.innerHTML = `
    <p aria-live="polite">⏳ Loading…</p>
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

// --- SHOWS LISTING ---
function makePageForShows(shows) {
  clearRoot();
  shows.forEach((show) => {
    const article = document.createElement("article");
    article.classList.add("show");
    article.setAttribute("tabindex", "0");

    // Title (clickable)
    const title = document.createElement("h2");
    title.textContent = show.name;
    title.style.cursor = "pointer";
    title.style.fontWeight = "bold";
    title.addEventListener("click", async () => {
      await showEpisodesView(show.id);
      showSelect.value = show.id;
    });
    article.appendChild(title);

    // Image
    if (show.image && show.image.medium) {
      const img = document.createElement("img");
      img.src = show.image.medium;
      img.alt = `${show.name} poster`;
      article.appendChild(img);
    }

    // Summary
    const summary = document.createElement("div");
    summary.classList.add("show-summary");
    summary.innerHTML = show.summary;
    article.appendChild(summary);

    // Genres
    const genres = document.createElement("div");
    genres.classList.add("show-genres");
    genres.textContent = `Genres: ${show.genres.join(" | ")}`;
    article.appendChild(genres);

    // Status
    const status = document.createElement("div");
    status.textContent = `Status: ${show.status}`;
    article.appendChild(status);

    // Rating
    const rating = document.createElement("div");
    rating.textContent = `Rated: ${show.rating?.average ?? "N/A"}`;
    article.appendChild(rating);

    // Runtime
    const runtime = document.createElement("div");
    runtime.textContent = `Runtime: ${show.runtime ?? "N/A"}`;
    article.appendChild(runtime);

    rootElem.appendChild(article);
  });
}

function handleSearch() {
  if (fetchFailed) return;
  const query = searchInput.value.toLowerCase().trim();
  if (currentView === "shows") {
    // Show search: name, genres, summary
    if (!query) {
      searchResultInfos.innerHTML = "";
      makePageForShows(allShows);
      showSelect.selectedIndex = 0;
      return;
    }
    const results = allShows.filter((show) => {
      return (
        show.name.toLowerCase().includes(query) ||
        show.genres.join(" ").toLowerCase().includes(query) ||
        show.summary.toLowerCase().includes(query)
      );
    });
    makePageForShows(results);
    searchResultInfos.innerHTML =
      results.length > 0
        ? `Filtering for <b>${query}</b> &mdash; found ${results.length} show${
            results.length === 1 ? "" : "s"
          }`
        : `No results found for "${query}"`;
    showSelect.selectedIndex = 0;
  } else {
    // Episode search
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

// --- VIEW SWITCHING ---
function showShowsView() {
  currentView = "shows";
  clearRoot();
  makePageForShows(allShows);
  episodeSelect.innerHTML = "";
  searchInput.value = "";
  searchResultInfos.innerHTML = "";
  showSelect.selectedIndex = 0;
  // Remove navigation link if present
  removeNavLink();
}

async function showEpisodesView(showId) {
  currentView = "episodes";
  try {
    allEpisodes = await fetchEpisodes(showId);
  } catch (err) {
    showErrorMessage("Failed to load episode data. Please try again later.");
    fetchFailed = true;
    return;
  }
  clearRoot();
  makePageForEpisodes(allEpisodes);
  populateEpisodeSelect(allEpisodes);
  searchInput.value = "";
  searchResultInfos.innerHTML = "";
  addNavLink();
}

function addNavLink() {
  // Add navigation link to return to shows listing
  let nav = document.getElementById("back-to-shows");
  if (!nav) {
    nav = document.createElement("a");
    nav.id = "back-to-shows";
    nav.href = "#";
    nav.textContent = "← Back to shows listing";
    nav.className = "btn";
    nav.style.display = "block";
    nav.style.margin = "1rem auto";
    nav.style.textAlign = "center";
    nav.addEventListener("click", (e) => {
      e.preventDefault();
      showShowsView();
    });
    rootElem.parentNode.insertBefore(nav, rootElem);
  }
}

function removeNavLink() {
  let nav = document.getElementById("back-to-shows");
  if (nav) nav.remove();
}
