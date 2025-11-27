//You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  episodeList.forEach((episode) => {
    const episodeElem = document.createElement("div");
    episodeElem.classList.add("episode");

    const titleElem = document.createElement("h2");

    const seasonNum = episode.season.toString().padStart(2, "0");
    const episodeNum = episode.number.toString().padStart(2, "0");
    titleElem.textContent = `${episode.name} - S${seasonNum}E${episodeNum}`;

    episodeElem.appendChild(titleElem);

    const imgElem = document.createElement("img");
    imgElem.src = episode.image.medium;
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

window.onload = setup;
