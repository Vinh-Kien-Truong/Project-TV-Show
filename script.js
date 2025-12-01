//You can edit ALL of the code here
const rootElem = document.getElementById("root");
const searchInput = document.getElementById("search-input");
const searchSelect = document.getElementById("search-select");
const searchResultInfos = document.getElementById("search-results-infos");
const allEpisodes = getAllEpisodes();

function setup() {
  makePageForEpisodes(allEpisodes);
  populateSelect();
  searchInput.addEventListener("input", (e) => handleSearch(e));
  searchSelect.addEventListener("change", (e) => handleSearch(e));
}

function makePageForEpisodes(episodeList) {
  // Empty previous list.
  resetRoot();
  episodeList.forEach((episode) => {
    const episodeElem = document.createElement("article");
    episodeElem.classList.add("episode");
    episodeElem.setAttribute("tabindex", "0");

    const titleElem = document.createElement("h2");

    const seasonNum = episode.season.toString().padStart(2, "0");
    const episodeNum = episode.number.toString().padStart(2, "0");
    titleElem.textContent = `${episode.name} - S${seasonNum}E${episodeNum}`;

    episodeElem.appendChild(titleElem);

    const imgElem = document.createElement("img");
    imgElem.src = episode.image.medium;
    imgElem.alt = `${episode.name} thumbnail`;
    episodeElem.appendChild(imgElem);

    const summaryElem = document.createElement("div");
    summaryElem.innerHTML = episode.summary;
    episodeElem.appendChild(summaryElem);

    rootElem.appendChild(episodeElem);
  });

  const creditElem = document.createElement("footer");
  creditElem.innerHTML = `Data sourced from <a href="https://tvmaze.com/">TVMaze.com</a>`;
  rootElem.appendChild(creditElem);
}

function handleSearch(e) {
  const input = e.target.value;
  const tagType = e.target.tagName;
  if (!input) {
    searchResultInfos.innerHTML = "";
    makePageForEpisodes(allEpisodes);
    return;
  }
  const results = allEpisodes.filter(({ name, summary }) => {
    return (
      name.toLowerCase().includes(input.toLowerCase()) ||
      summary.toLowerCase().includes(input.toLowerCase())
    );
  });

  results.length > 0
    ? makePageForEpisodes(results)
    : makePageForEpisodes(allEpisodes);

  // Reset other research.
  if (tagType === "INPUT") {
    searchResultInfos.innerHTML =
      results.length > 0
        ? `<p>"${input}" Found in ${results.length} episodes.</p>`
        : "";
    searchSelect.selectedIndex = 0;
  }
  if (tagType === "SELECT") {
    searchResultInfos.innerHTML = "";
    searchInput.value = "";
  }
}

function resetRoot() {
  rootElem.innerHTML = "";
  searchResultInfos.innerHTML = "";
}
function populateSelect() {
  let options = `<option>Select an episode</option>`;
  for (let episode of allEpisodes) {
    const id = `${episode.season}E${episode.number}`;
    options += `<option name='${id}' value='${episode.name}' >${id} - ${episode.name}</option>`;
  }
  searchSelect.innerHTML = options;
}

window.onload = setup;
