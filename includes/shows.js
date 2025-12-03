// Populate shows select.
export function populateShowSelect(select, shows) {
  const allShows = alphabeticalSort(shows);
  let html = `<option>Select a show</option>`;

  allShows.forEach((show) => {
    html += `<option value="${show.id}">${show.name}</option>`;
  });

  select.innerHTML = html;
}

// Display shows.
export function makePageForShows(rootElem, allShowsRaw) {
  if (!Array.isArray(allShowsRaw) || !allShowsRaw.length) {
    throw new Error("Cannot display the shows. Check why.");
  }
  // Sort alphabetical.
  const allShows = alphabeticalSort(allShowsRaw);

  for (let show of allShows) {
    // article.
    const article = document.createElement("article");
    article.dataset.id = show.id;
    article.classList.add("show");
    article.setAttribute("tabindex", "0");

    // Image.
    if (show.image && show.image.medium) {
      const img = document.createElement("img");
      img.src = show.image.medium;
      img.alt = `${show.name} thumbnail`;
      article.appendChild(img);
    }

    // Title.
    const title = document.createElement("h2");
    title.textContent = show.name;
    article.appendChild(title);

    // Summary.
    const summary = document.createElement("div");
    summary.classList.add("show-summary");
    summary.innerHTML = show.summary;
    article.appendChild(summary);

    // Genres.
    const genres = document.createElement("div");
    genres.classList.add("show-genres");
    show?.genres.forEach(
      (genre) =>
        (genres.innerHTML += `<button class="btn show-genre" type="text">${genre}</button>`)
    );
    article.appendChild(genres);

    // Start-end.
    const startEnd = document.createElement("p");
    genres.classList.add("show-start-end");
    startEnd.innerHTML = `<small><b>${show.premiered} | ${show.ended}</b></small>`;
    article.appendChild(startEnd);

    rootElem.appendChild(article);
  }
}

// Sort alphabetical case insensitive function.
function alphabeticalSort(shows) {
  return shows.sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
}
