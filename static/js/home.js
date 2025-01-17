var theme = "light";
var originalTheme = "system";
var contentList = [];

function detectColorScheme() {
  if (localStorage.getItem("theme")) {
    if (localStorage.getItem("theme") == "dark") {
      theme = "dark";
    } else {
      theme = "light";
    }
    originalTheme = localStorage.getItem("theme");
  } else if (!window.matchMedia) {
    return false;
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    theme = "dark";
  }

  if (theme == "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}
function changeTheme(t) {
  originalTheme = t;
  if (t == "system") {
    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        t = "dark";
      } else {
        t = "light";
      }

      localStorage.removeItem("theme");
    }
  } else {
    localStorage.setItem("theme", t);
  }
  document.documentElement.setAttribute("data-theme", t);
  theme = t;
  return theme;
}
detectColorScheme();

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
darkModePreference.addEventListener("change", (event) => {
  if (event.matches) {
    changeTheme("dark");
  } else {
    changeTheme("light");
  }
});

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("close-btn");
const modalBack = document.getElementById("modal-back");
const main = document.getElementById("main");
const filtresDiv = document.getElementById("filtres");

// modals
const modalAdd = document.getElementById("modal-add");
const modalTierlist = document.getElementById("modal-tierlist");
const modalEdit = document.getElementById("modal-edit");
const modalSettings = document.getElementById("modal-settings");

function toggleSidebar() {
  if (window.innerWidth > 1200) {
    sidebar.classList.toggle("close");
  } else {
    sidebar.classList.toggle("open");
  }
}
function closeSidebar(onlymobile = false) {
  if (window.innerWidth > 1200 && !onlymobile) {
    sidebar.classList.add("close");
  } else {
    sidebar.classList.remove("open");
  }
}

menuBtn.addEventListener("click", toggleSidebar);

closeBtn.addEventListener("click", closeSidebar);

modalBack.addEventListener("click", (event) => {
  if (!menuBtn.contains(event.target)) {
    closeSidebar(true);
    modalAdd.classList.remove("open");
  }
});

let prev_width = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth > 1200 && prev_width <= 1200) {
    sidebar.classList.remove("close");
    sidebar.classList.add("open");
  } else if (window.innerWidth <= 1200 && prev_width > 1200) {
    sidebar.classList.remove("open");
    sidebar.classList.remove("close");
  }
  prev_width = window.innerWidth;
});

const filtres = document.getElementsByClassName("filtre");

for (let i = 0; i < filtres.length; i++) {
  filtres[i].addEventListener("click", () => {
    if (filtres[i].classList.contains("selected")) {
      filtres[i].classList.remove("selected");
    } else {
      filtres[i].classList.add("selected");

      if (i == 0) {
        for (let j = 1; j < filtres.length; j++) {
          filtres[j].classList.remove("selected");
        }
      }
    }

    var nb_selected = 0;
    for (let j = 0; j < filtres.length; j++) {
      if (filtres[j].classList.contains("selected")) nb_selected++;
    }

    if (nb_selected == 0) {
      filtres[0].classList.add("selected");
    } else if (nb_selected > 1) {
      filtres[0].classList.remove("selected");
    }

    search();
  });
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]/gi, "");
}

function levenshtein(a, b) {
  const matrix = [];

  // Initialiser la matrice
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Remplir la matrice
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function partialRatio(str1, str2) {
  const shorter = str1.length < str2.length ? str1 : str2;
  const longer = str1.length >= str2.length ? str1 : str2;

  let highestRatio = 0;

  for (let i = 0; i <= longer.length - shorter.length; i++) {
    const substring = longer.substring(i, i + shorter.length);
    const distance = levenshtein(shorter, substring);
    const ratio = (1 - distance / shorter.length) * 100;

    if (ratio > highestRatio) {
      highestRatio = ratio;
    }
  }

  return Math.round(highestRatio);
}

let searchBar = document.getElementById("search");
searchBar.addEventListener("input", () => {
  search();
});

function search() {
  var selectedTypeFiltres = [];
  var selectedStatusFiltres = [];
  for (let j = 0; j < filtres.length; j++) {
    if (filtres[j].classList.contains("selected")) {
      if (
        ["tv", "movie", "book", "books"].includes(filtres[j].dataset.filtre)
      ) {
        selectedTypeFiltres.push(filtres[j].dataset.filtre);

        if (filtres[j].dataset.filtre == "book") {
          selectedTypeFiltres.push("books");
        }
      }
      if (
        ["onwatch", "towatch", "done", "giveup"].includes(
          filtres[j].dataset.filtre
        )
      ) {
        selectedStatusFiltres.push(filtres[j].dataset.filtre);
      }
    }
  }

  var contents = document.getElementsByClassName("content");
  Array.from(contents).forEach((content) => {
    if (
      (partialRatio(
        normalizeText(content.innerText),
        normalizeText(searchBar.value)
      ) >= 80 ||
        searchBar.value == "") &&
      (selectedTypeFiltres.includes(content.dataset.type) ||
        selectedTypeFiltres.length == 0) &&
      (selectedStatusFiltres.includes(content.dataset.status) ||
        selectedStatusFiltres.length == 0)
    ) {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  });
}

function getContentData(type, id) {
  const url = "/api/get/" + type + "/" + id;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        if (
          Math.floor(response.status / 100) == 4 ||
          Math.floor(response.status / 100) == 5
        ) {
          window.location.href = "/notfound";
        }
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}
function getUserContentData(type, id) {
  const url = "/api/user/get/" + type + "/" + id;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la sélection des données :", error);
    });
}

function closeModalEditFunc(modify_history = true) {
  modalEdit.classList.remove("open");
  modalEdit.classList.remove("native");

  if (modify_history) {
    window.history.pushState({ modal: "" }, "", "/app/");
  }
}

const closeModalEdit = document.getElementById("close-modal-edit");
closeModalEdit.addEventListener("click", closeModalEditFunc);

const BtnAdd = document.getElementById("add-btn");
const modalAddChoiceBtn = document.getElementById("modal-add-choice-btn");
const modalAddContent = document.getElementById("modal-add-content");
const modalAddSearch = document.querySelector("#modal-add-search");
const modalAddResults = document.querySelector("#results");
const modalAddTitle = document.getElementById("modal-add-title");

function openModalAdd() {
  modalAdd.classList.add("open");
  modalAdd.classList.remove("fullscreen");
  modalAddChoiceBtn.style.display = "block";
  modalAddContent.style.display = "none";

  modalAddTitle.innerHTML = "Ajouter des oeuvres";

  window.history.pushState({ modal: "add" }, "", "/app/add");
}

BtnAdd.addEventListener("click", openModalAdd);

const closeModalAdd = document.getElementById("close-modal-add");
closeModalAdd.addEventListener("click", () => {
  modalAdd.classList.remove("open");
  modalAdd.classList.remove("fullscreen");
  modalAdd.classList.remove("native");

  window.history.pushState({ modal: "" }, "", "/app/");
});

const modalAddBtns = document.getElementsByClassName("modal-add-btn");
for (let i = 0; i < modalAddBtns.length; i++) {
  modalAddBtns[i].addEventListener("click", () => {
    modalAdd.classList.toggle("fullscreen");
    modalAdd.dataset.type = modalAddBtns[i].dataset.type;
    modalAddChoiceBtn.style.display = "none";
    modalAddContent.style.display = "block";

    modalAddTitle.innerText =
      "Ajouter des " + modalAddBtns[i].children[1].innerText;

    modalAddSearch.value = "";
    modalAddResults.innerHTML = "";
  });
}

const addLibraryBtn = document.getElementById("add-library");
const deleteLibraryBtn = document.getElementById("delete-library");
const giveUpBtn = document.getElementById("give-up");
const ungiveUpBtn = document.getElementById("ungive-up");
const rankSelect = document.getElementById("modal-edit-rating");
var sendChangesTimer = 0;
async function updateSelectedEpisodes(nb_selected, season) {
  const selectedSeason = document.getElementsByClassName("subelements")[season];
  const selectedEpisodes = selectedSeason.getElementsByClassName("subelement");

  for (let i = 0; i < selectedEpisodes.length; i++) {
    if (i < nb_selected) {
      selectedEpisodes[i].querySelector(".subelement-checkbox").checked = true;
    } else {
      selectedEpisodes[i].querySelector(".subelement-checkbox").checked = false;
    }
  }

  await sendSelectedData(
    modalEdit.dataset.id,
    modalEdit.dataset.type,
    selectedSeason.dataset.season_number,
    season
  ).then((response) => {
    updateContent(response.data);
  });
}

async function sendSelectedData(id, type, season_number = null, season = null) {
  clearTimeout(sendChangesTimer);

  // On transforme l'envoi des données en promesse pour pouvoir bien utiliser await
  return new Promise((resolve, reject) => {
    sendChangesTimer = setTimeout(() => {
      let changes;
      if (season != null) {
        changes = [];
        const selectedEpisodes = document
          .getElementsByClassName("subelements")
          [season].getElementsByClassName("subelement");

        let shouldCreateNewGroup = true;
        for (const episodeDiv of selectedEpisodes) {
          if (episodeDiv.querySelector(".subelement-checkbox").checked) {
            if (shouldCreateNewGroup) {
              changes.push(episodeDiv.dataset.id.toString());
            } else {
              changes[changes.length - 1] =
                changes[changes.length - 1].split("-")[0] +
                "-" +
                episodeDiv.dataset.id.toString();
            }
            shouldCreateNewGroup = false;
          } else {
            shouldCreateNewGroup = true;
          }
        }
      } else {
        changes = document.querySelector("#element-checkbox").checked;
      }

      const url = "/api/user/update/" + type + "/" + id;
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          season_number: season_number,
          changes: changes,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur HTTP, statut : " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          if (addLibraryBtn.style.display == "flex") {
            addLibraryBtn.style.display = "none";
            deleteLibraryBtn.style.display = "flex";
            giveUpBtn.style.display = "flex";
          }
          resolve(data);
        })
        .catch((error) => {
          console.error("Erreur lors de la requête :", error);
          reject(error);
        });
    }, 1000);
  });
}

function modalEditAddListener(type) {
  if (type == "books" || type == "tv") {
    const seasonHeaders = document.getElementsByClassName("element-header");
    for (let i = 0; i < seasonHeaders.length; i++) {
      seasonHeaders[i].addEventListener("click", () => {
        seasonHeaders[i].parentNode.classList.toggle("open");
      });
    }

    const seasonMoreDetails = document.getElementsByClassName(
      "element-more-details"
    );
    for (let i = 0; i < seasonMoreDetails.length; i++) {
      seasonMoreDetails[i].addEventListener("click", () => {
        const seasonEpisodes =
          seasonMoreDetails[i].parentNode.parentNode.parentNode.parentNode
            .children[2];
        if (seasonEpisodes.style.maxHeight == "0px") {
          seasonEpisodes.style.maxHeight = "30000px";
        } else {
          seasonEpisodes.style.maxHeight = "0px";
        }
      });
    }

    const SeasonSliders = document.getElementsByClassName("element-slider");
    for (let i = 0; i < SeasonSliders.length; i++) {
      SeasonSliders[i].addEventListener("input", () => {
        const seasonNumber = SeasonSliders[i].parentNode.children[0];
        seasonNumber.value = SeasonSliders[i].value;

        updateSelectedEpisodes(SeasonSliders[i].value, i);
      });
    }

    const SeasonNumbers = document.getElementsByClassName("element-number");
    for (let i = 0; i < SeasonNumbers.length; i++) {
      SeasonNumbers[i].addEventListener("input", () => {
        const seasonSlider = SeasonNumbers[i].parentNode.children[1];
        seasonSlider.value = SeasonNumbers[i].value;

        updateSelectedEpisodes(SeasonSliders[i].value, i);
      });
    }

    const EpisodeCheckboxes = document.getElementsByClassName(
      "subelement-checkbox"
    );
    for (let i = 0; i < EpisodeCheckboxes.length; i++) {
      EpisodeCheckboxes[i].addEventListener("change", () => {
        const seasonEpisodes =
          EpisodeCheckboxes[i].parentNode.parentNode.getElementsByClassName(
            "subelement"
          );
        var nb_selected = 0;
        for (let j = 0; j < seasonEpisodes.length; j++) {
          if (
            seasonEpisodes[j].getElementsByClassName("subelement-checkbox")[0]
              .checked
          )
            nb_selected++;
        }
        const season = EpisodeCheckboxes[i].parentNode.parentNode.parentNode;
        const seasonSlider = season.getElementsByClassName("element-slider")[0];
        const seasonNumber = season.getElementsByClassName("element-number")[0];

        seasonSlider.value = nb_selected;
        seasonNumber.value = nb_selected;

        sendSelectedData(
          modalEdit.dataset.id,
          modalEdit.dataset.type,
          season.querySelector(".subelements").dataset.season_number,
          Array.prototype.indexOf.call(season.parentNode.children, season)
        ).then((response) => {
          updateContent(response.data);
        });
      });
    }
  } else {
    const element = document.querySelector("#modal-edit .element");
    element.addEventListener("change", () => {
      sendSelectedData(modalEdit.dataset.id, modalEdit.dataset.type).then(
        (response) => {
          updateContent(response.data);
        }
      );
    });
  }
}

const modalEditTitle = document.getElementById("modal-edit-title");
const modalEditPicture = document.getElementById("modal-edit-picture");
const modalEditElements = document.getElementById("elements");
async function openModalEdit(data_id, data_type) {
  const id = data_id;
  const type = data_type;

  const loader_html =
    '<div class="loader"><span class="loader__element"></span><span class="loader__element"></span><span class="loader__element"></span></div>';
  document.body.insertAdjacentHTML("beforeend", loader_html);

  let contentData = await getContentData(type, id);
  let contentUserData = await getUserContentData(type, id);

  var loader = document.getElementsByClassName("loader");

  while (loader[0]) {
    loader[0].parentNode.removeChild(loader[0]);
  }

  modalEditTitle.innerText = contentData.title;

  modalEditPicture.innerHTML = "";
  if (type == "movie" || type == "tv") {
    const liens = [
      {
        srcset: "https://image.tmdb.org/t/p/w1280" + contentData.image.backdrop,
        media: "(min-width: 800px)",
      },
      {
        srcset: "https://image.tmdb.org/t/p/w780" + contentData.image.backdrop,
        media: "(min-width: 500px)",
      },
      {
        srcset: "https://image.tmdb.org/t/p/w500" + contentData.image.backdrop,
      },
    ];

    const modalEditNewPicture = document.createElement("picture");
    liens.forEach((lien) => {
      const source = document.createElement("source");
      source.srcset = lien.srcset;
      if (lien.media) {
        source.media = lien.media;
      }
      modalEditNewPicture.appendChild(source);
    });

    const modalEditNewImg = document.createElement("img");
    modalEditNewImg.src =
      "https://image.tmdb.org/t/p/original" + contentData.image.backdrop;
    modalEditNewImg.alt = contentData.title + " image";
    modalEditNewImg.loading = "lazy";

    modalEditNewPicture.appendChild(modalEditNewImg);
    modalEditPicture.appendChild(modalEditNewPicture);
  } else {
    const modalEditNewImg = document.createElement("img");
    modalEditNewImg.src = contentData.image["264"];
    modalEditNewImg.alt = contentData.title + " image";
    modalEditNewImg.loading = "lazy";
    modalEditPicture.appendChild(modalEditNewImg);
  }

  const modalAddDescription = document.getElementById("description");
  modalAddDescription.innerText = contentData.overview;

  modalEdit.classList.add("open");
  modalEdit.dataset.id = id;
  modalEdit.dataset.type = type;
  modalAdd.classList.remove("open");
  modalAdd.classList.remove("fullscreen");

  if (contentUserData.rank == null) {
    rankSelect.value = "";
  } else {
    rankSelect.value = contentUserData.rank;
  }

  if (contentUserData.exist) {
    addLibraryBtn.style.display = "none";
    deleteLibraryBtn.style.display = "flex";
    if (contentUserData.status == "giveup") {
      ungiveUpBtn.style.display = "flex";
      giveUpBtn.style.display = "none";
    } else {
      ungiveUpBtn.style.display = "none";
      giveUpBtn.style.display = "flex";
    }
  } else {
    addLibraryBtn.style.display = "flex";
    deleteLibraryBtn.style.display = "none";
    giveUpBtn.style.display = "none";
    ungiveUpBtn.style.display = "none";
  }

  modalEditElements.innerHTML = "";
  if (type == "tv" || type == "books") {
    contentData.contents.forEach((content) => {
      if (contentUserData.exist) {
        contentUser = contentUserData.watch.find(
          (contentUser) =>
            contentUser.season_number == content.season_number ||
            contentUser.season_number == "undefined"
        );
      } else {
        contentUser = null;
      }

      let nbSlectedEpisodes = 0;
      let selectedEpisodes = [];
      if (contentUser) {
        contentUser.watched.forEach((group) => {
          if (group.includes("-")) {
            nbSlectedEpisodes +=
              parseInt(group.split("-")[1]) - parseInt(group.split("-")[0]) + 1;
            for (
              let index = parseInt(group.split("-")[0]);
              index < parseInt(group.split("-")[1]) + 1;
              index++
            ) {
              selectedEpisodes.push(index);
            }
          } else {
            nbSlectedEpisodes += 1;
            selectedEpisodes.push(parseInt(group));
          }
        });
      }
      // Crée le conteneur de saison
      const seasonDiv = document.createElement("div");
      seasonDiv.classList.add("element");

      // Détermine l'image et le titre en fonction du type
      let imageSrc, title, headerContent;

      if (type === "tv") {
        imageSrc = `https://image.tmdb.org/t/p/w200${content["image"]}`;
        title =
          content["season_number"] === 0
            ? content["title"]
            : `Saison ${content["season_number"]}`;
        headerContent = `
              <div class="element-header">
                  <h3 class="roboto">${title}</h3>
                  <img src="/static/icons/keyboard_arrow_down.svg" alt="down arrow icon" />
              </div>`;
      } else {
        imageSrc = contentData.image["264"];
        headerContent = `
              <div class="element-header">
                  <h3 class="roboto">${content["title"]}</h3>
                  <img src="/static/icons/keyboard_arrow_down.svg" alt="down arrow icon" />
              </div>`;
      }

      // Crée l'élément d'image
      const image = document.createElement("img");
      image.src = imageSrc;
      image.loading = "lazy";
      image.alt = `Poster de la saison ${content["season_number"]}`;

      const elementDetailsDiv = document.createElement("div");
      elementDetailsDiv.classList.add("element-details");

      const elementInfoDiv = document.createElement("div");
      elementInfoDiv.classList.add("element-info");

      const titleP = document.createElement("p");
      titleP.classList.add("element-title", "tilt-neon");
      let contentTitle = content["title"];
      try {
        contentTitle +=
          " - " + content["air_date"].split("-").reverse().join("/");
      } catch (error) {}
      titleP.textContent = contentTitle;

      const descriptionP = document.createElement("p");
      descriptionP.classList.add("roboto", "element-description");
      descriptionP.textContent = content["overview"];

      const controlsDiv = document.createElement("div");
      controlsDiv.classList.add("element-controls");

      const numberInput = document.createElement("input");
      numberInput.setAttribute("aria-label", "Nombre d'éléments vus");
      numberInput.classList.add("element-number");
      numberInput.setAttribute("type", "number");
      numberInput.setAttribute("value", nbSlectedEpisodes.toString());
      numberInput.setAttribute("min", "0");
      numberInput.setAttribute("max", content.contents.length);
      numberInput.setAttribute("name", "nbSlectedEpisodes");

      const sliderInput = document.createElement("input");
      sliderInput.setAttribute("aria-label", "Nombre d'éléments vus");
      sliderInput.classList.add("element-slider");
      sliderInput.setAttribute("type", "range");
      sliderInput.setAttribute("value", nbSlectedEpisodes.toString());
      sliderInput.setAttribute("min", "0");
      sliderInput.setAttribute("max", content.contents.length);

      const moreDetailsButton = document.createElement("button");
      moreDetailsButton.classList.add("element-more-details");
      const moreDetailsImg = document.createElement("img");
      moreDetailsImg.src = "/static/icons/more.svg";
      moreDetailsImg.alt = "Bouton en savoir plus..";
      moreDetailsButton.appendChild(moreDetailsImg);

      controlsDiv.appendChild(numberInput);
      controlsDiv.appendChild(sliderInput);
      controlsDiv.appendChild(moreDetailsButton);

      elementInfoDiv.appendChild(titleP);
      elementInfoDiv.appendChild(descriptionP);
      elementInfoDiv.appendChild(controlsDiv);

      elementDetailsDiv.appendChild(image);
      elementDetailsDiv.appendChild(elementInfoDiv);

      // Crée les épisodes
      const episodesDiv = document.createElement("div");
      episodesDiv.classList.add("subelements");
      episodesDiv.style.maxHeight = "0px";
      episodesDiv.dataset.season_number = content["season_number"];

      let episodeNumber = 1;
      content.contents.forEach((episode) => {
        const episodeDiv = document.createElement("div");
        episodeDiv.classList.add("subelement");
        episodeDiv.dataset.id = episodeNumber;

        const label = document.createElement("label");
        label.setAttribute(
          "for",
          `s${content["season_number"]}-ep${episodeNumber}`
        );
        label.textContent = episode;

        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute(
          "name",
          `s${content["season_number"]}-ep${episodeNumber}`
        );
        checkbox.setAttribute(
          "id",
          `s${content["season_number"]}-ep${episodeNumber}`
        );
        checkbox.classList.add("subelement-checkbox");

        if (selectedEpisodes.includes(episodeNumber)) {
          checkbox.checked = true;
        }

        episodeDiv.appendChild(label);
        episodeDiv.appendChild(checkbox);

        episodesDiv.appendChild(episodeDiv);
        episodeNumber++;
      });

      // Assemble et ajoute au DOM
      seasonDiv.appendChild(
        document.createRange().createContextualFragment(headerContent)
      );
      seasonDiv.appendChild(elementDetailsDiv);
      seasonDiv.appendChild(episodesDiv);

      modalEditElements.appendChild(seasonDiv);
    });
  } else {
    contentUser = contentUserData.watch;

    checked = "";
    if (contentUser == true) {
      checked = "checked";
    }
    modalEditElements.innerHTML = `<div class="element"><label class="element-header"><h3 class="roboto">${contentData.title}</h3><input type="checkbox" name="element-checkbox" id="element-checkbox" ${checked}></label></div>`;
  }

  window.history.pushState(
    { modal: "edit", id: data_id, type: data_type },
    "",
    "/app/" + data_type + "/" + data_id.toString() + "/"
  );
  modalEditAddListener(type);
}
function closeAllModals(modify_history = false) {
  closeModalEditFunc(false);

  modalAdd.classList.remove("open");
  modalAdd.classList.remove("fullscreen");
  modalAdd.classList.remove("native");

  modalTierlist.classList.remove("open");
  modalTierlist.classList.remove("native");

  if (modalSettings.classList.contains("open")) closeModalSettings(false);

  if (modify_history) {
    window.history.pushState({ modal: "" }, "", "/app/");
  }
}
document.body.addEventListener("keydown", function (e) {
  if (e.key == "Escape") {
    closeAllModals(true);
  }
});

let ModalAddSearchTimer;

modalAddSearch.addEventListener("input", function () {
  clearTimeout(ModalAddSearchTimer);

  ModalAddSearchTimer = setTimeout(() => {
    const url =
      "/api/new/" + modalAdd.dataset.type + "/" + modalAddSearch.value;

    // Faire une requête GET pour récupérer les données JSON
    fetch(url)
      .then((response) => {
        // Vérifier si la requête a réussi
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        // Convertir la réponse en JSON
        return response.json();
      })
      .then((data) => {
        modalAddResults.innerHTML = "";
        data.results.forEach((element) => {
          var all_results_card = "";
          element.contents.forEach((card) => {
            var imagePath = "";
            if (
              modalAdd.dataset.type == "movie" ||
              modalAdd.dataset.type == "tv"
            ) {
              if (card.poster_path != null) {
                imagePath =
                  "https://image.tmdb.org/t/p/w154" + card.poster_path;
              }
              var dataType = modalAdd.dataset.type;
            } else {
              var dataType = card.type;
              if (dataType == "book") {
                imagePath = card.cover_double;
              }
            }
            if (modalAdd.dataset.type == "movie") {
              var cardTitle = card.title;
            } else {
              var cardTitle = card.name;
              if (dataType == "books") {
                cardTitle += ` (${card.book_count})`;
              }
            }

            all_results_card += `
            <button class="modal-add-result" data-id="${card.id}" data-type="${dataType}">
            `;
            if (imagePath != "") {
              all_results_card += `
              <img
                src="${imagePath}"
                alt="${cardTitle} poster"
                loading="lazy"
              />
              `;
            }
            all_results_card += `
              <p>${cardTitle}</p>
            </button>
            `;
          });
          const elementDiv = `
          <div class="type-of-result">
            <h3>${element.title}</h3>
            <div class="results-contents">
              ${all_results_card}	
            </div>
          </div>
          `;
          modalAddResults.insertAdjacentHTML("beforeend", elementDiv);
        });

        const modalAddResult =
          document.getElementsByClassName("modal-add-result");

        for (let i = 0; i < modalAddResult.length; i++) {
          modalAddResult[i].addEventListener("click", () => {
            openModalEdit(
              modalAddResult[i].dataset.id,
              modalAddResult[i].dataset.type
            );
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données :", error);
      });
  }, 1000);
});
function getList(hard = false) {
  let url = "/api/user/list";
  if (hard) {
    url += "/hard";
  }

  return fetch(url)
    .then((response) => {
      if (response.status === 401) {
        window.location.href = "/?action=login";
      } else {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        return response.json();
      }
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}
function htmlToNode(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const nNodes = template.content.childNodes.length;
  if (nNodes !== 1) {
    throw new Error(
      `html parameter must represent a single node; got ${nNodes}. ` +
        "Note that leading or trailing spaces around an element in your " +
        'HTML, like " <img/> ", get parsed as text nodes neighbouring ' +
        "the element; call .trim() on your input to avoid this."
    );
  }
  return template.content.firstChild;
}
function contentInnerHTML(content) {
  let checked = "";
  if (content.checked) {
    checked = "checked";
  }

  const innerHTML = `<input type="checkbox" id="checkbox_${content.id
    .toString()
    .replaceAll(" ", "_")}" name="checkbox_${content.id
    .toString()
    .replaceAll(" ", "_")}" disabled ${checked}/><span>${content.text}</span>`;

  return innerHTML;
}
function contentToHTML(content) {
  let image = "";
  if (content.type == "tv" || content.type == "movie") {
    image = "https://image.tmdb.org/t/p/w200" + content.catalog.image.backdrop;
  } else {
    image = content.catalog.image["121"];
  }
  const contentHTML = `<button class="content" data-id="${
    content.id
  }" data-type="${content.type}" data-status="${content.status}">
    <label>${contentInnerHTML(content)}</label>
    <div>
      <div>
        <h3>${content.catalog.title}</h3>
        <img loading="lazy" src="${image}" alt="${content.catalog.title}" />
      </div>
      <p>${content.catalog.overview}</p>
    </div>
  </button>`;

  return contentHTML;
}
function addContentToList(content) {
  let node = htmlToNode(contentToHTML(content));
  node.addEventListener("click", () => {
    openModalEdit(node.dataset.id, node.dataset.type);
  });
  contentsContainer.insertAdjacentElement("beforeend", node);
}
function updateContent(content) {
  Array.from(contentsContainer.children).forEach((element) => {
    if (
      element.dataset.id == content.id &&
      element.dataset.type == content.type
    ) {
      element.dataset.status = content.status;
      element.children[0].innerHTML = contentInnerHTML(content);
    }
  });
}

const contentsContainer = document.getElementById("contents");
async function reloadList(hard = false) {
  let contentsData = await getList(hard);

  contentsContainer.innerHTML = "";
  contentsData.forEach((content) => {
    addContentToList(content);
  });

  contentList = contentsData;

  search();
}

function addList(type, id) {
  const url = "/api/user/add/" + type + "/" + id;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données :", error);
        reject(error);
      });
  });
}
async function AddLibrary() {
  return new Promise((resolve, reject) => {
    addList(modalEdit.dataset.type, modalEdit.dataset.id).then((response) => {
      if (response.status == "success") {
        addLibraryBtn.style.display = "none";
        deleteLibraryBtn.style.display = "flex";
        giveUpBtn.style.display = "flex";

        addContentToList(response.data);

        resolve(response);
      } else {
        reject(response);
      }
    });
  });
}
addLibraryBtn.addEventListener("click", () => {
  AddLibrary();
});

function deleteList(type, id) {
  const url = "/api/user/delete/" + type + "/" + id;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}
async function DeleteLibrary() {
  return new Promise((resolve, reject) => {
    deleteList(modalEdit.dataset.type, modalEdit.dataset.id).then(
      (response) => {
        if (response.status == "success") {
          addLibraryBtn.style.display = "flex";
          deleteLibraryBtn.style.display = "none";
          giveUpBtn.style.display = "none";

          Array.from(contentsContainer.children).forEach((content) => {
            if (
              content.dataset.id == modalEdit.dataset.id &&
              content.dataset.type == modalEdit.dataset.type
            ) {
              contentsContainer.removeChild(content);
            }
          });

          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
}
deleteLibraryBtn.addEventListener("click", () => {
  DeleteLibrary();
});

reloadList();

function toggleGiveUp(type, id) {
  const url = "/api/user/giveup/" + type + "/" + id;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}

async function GiveUp() {
  return new Promise((resolve, reject) => {
    toggleGiveUp(modalEdit.dataset.type, modalEdit.dataset.id).then(
      (response) => {
        if (response.status == "success") {
          giveUpBtn.style.display = "none";
          ungiveUpBtn.style.display = "flex";
          updateContent(response.data);

          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
}
async function UngiveUp() {
  return new Promise((resolve, reject) => {
    toggleGiveUp(modalEdit.dataset.type, modalEdit.dataset.id).then(
      (response) => {
        if (response.status == "success") {
          giveUpBtn.style.display = "flex";
          ungiveUpBtn.style.display = "none";
          updateContent(response.data);

          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
}
ungiveUpBtn.addEventListener("click", () => {
  UngiveUp();
});
giveUpBtn.addEventListener("click", () => {
  GiveUp();
});

async function sendRank(type, id, rank) {
  const url = "/api/user/rank/" + type + "/" + id;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rank: rank,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la sélection des données :", error);
    });
}
async function updateRank(type, id, rank) {
  return new Promise((resolve, reject) => {
    sendRank(type, id, rank).then((response) => {
      if (response.status == "success") {
        updateContent(response.data);
        
        if (addLibraryBtn.style.display == "flex") {
          addLibraryBtn.style.display = "none";
          deleteLibraryBtn.style.display = "flex";
          giveUpBtn.style.display = "flex";
        }

        resolve(response);
      } else {
        reject(response);
      }
    });
  });
}

rankSelect.addEventListener("change", () => {
  updateRank(modalEdit.dataset.type, modalEdit.dataset.id, rankSelect.value);
});

window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});

const tierlistBtn = document.getElementById("tierlist-btn");
const modalTierlistClose = document.getElementById("close-modal-tierlist");

function getTierlist() {
  const url = "/api/tierlist";
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}

function openModalTierlist() {
  if (!modalTierlistAlreadyOpen) {
    let tierlistScript = document.createElement("script");
    tierlistScript.src = "/static/js/tierlist.js";
    document.head.appendChild(tierlistScript);

    let tierlistStyle = document.createElement("link");
    tierlistStyle.rel = "stylesheet";
    tierlistStyle.href = "/static/css/tierlist.css";
    document.head.appendChild(tierlistStyle);

    modalTierlistAlreadyOpen = true;
  }

  let tierlistData = getTierlist();
  tierlistData.then((data) => {
    ["S", "A", "B", "C", "D", "E", "F", "Unknown"].forEach((element) => {
      let row = document.getElementById("non-classed");
      if (element != "Unknown") {
        row = document.getElementById("row-" + element.toLowerCase());
      }
      let container = row.querySelector(".container");
      container.innerHTML = "";
      data[element].forEach((catalog) => {
        let image = "";
        if (catalog["type"] == "tv" || catalog["type"] == "movie") {
          image = "https://image.tmdb.org/t/p/w92" + catalog["image"]["poster"];
        } else {
          image = catalog["image"]["66"];
        }
        container.insertAdjacentHTML(
          "beforeend",
          `<a class="draggable" data-type="${catalog["type"]}" data-id="${catalog["id"]}" draggable="true" href="/app/${catalog["type"]}/${catalog["id"]}/"><img src="${image}" alt="${catalog["title"]} image" title="${catalog["title"]}"/></a>`
        );
      });
    });
    initializeDraggables();
  });

  modalTierlist.classList.add("open");
  window.history.pushState({ modal: "tierlist" }, "", "/app/tierlist");
}

let modalTierlistAlreadyOpen = false;
tierlistBtn.addEventListener("click", openModalTierlist);
modalTierlistClose.addEventListener("click", () => {
  if (haveSentRank) {
    reloadList();
  }
  modalTierlist.classList.remove("open");
  haveSentRank = false;
  window.history.pushState({ modal: "" }, "", "/app/");
});

const settingsBtn = document.getElementById("settings-btn");
const modalSettingsClose = document.getElementById("close-modal-settings");

let modalSettingsAlreadyOpen = false;
function openModalSettings() {
  if (!modalSettingsAlreadyOpen) {
    let settingsStyle = document.createElement("link");
    settingsStyle.rel = "stylesheet";
    settingsStyle.href = "/static/css/settings.css";
    document.head.appendChild(settingsStyle);

    let settingsScript = document.createElement("script");
    settingsScript.src = "/static/js/settings.js";
    document.head.appendChild(settingsScript);

    modalSettingsAlreadyOpen = true;
  }
  modalSettings.classList.add("open");
  window.history.pushState({ modal: "settings" }, "", "/app/settings");
}

settingsBtn.addEventListener("click", openModalSettings);

function closeModalSettings(modify_history = true) {
  modalSettings.classList.remove("open");
  modalSettings.classList.remove("native");
  if (havetoUpdateList) {
    reloadList((hard = true));
  }
  if (modify_history) {
    window.history.pushState({ modal: "" }, "", "/app/");
  }
}
modalSettingsClose.addEventListener("click", closeModalSettings);

function checkModalAlreadyOpen() {
  if (modalSettings.classList.contains("open")) {
    openModalSettings();
  }
  if (modalTierlist.classList.contains("open")) {
    openModalTierlist();
  }
  if (modalEdit.classList.contains("open")) {
    openModalEdit(modalEdit.dataset.id, modalEdit.dataset.type);
  }
  if (modalAdd.classList.contains("open")) {
    openModalAdd();
  }
}
function openModal(name, id = null, type = null) {
  if (name === "settings") {
    openModalSettings();
  } else if (name === "tierlist") {
    openModalTierlist();
  } else if (name === "edit") {
    openModalEdit(id, type);
  } else if (name === "add") {
    openModalAdd();
  }
}
window.addEventListener("popstate", (e) => {
  if (e.state) {
    closeAllModals();
    if (e.state.modal) {
      openModal(e.state.modal, e.state.id, e.state.type);
    } else {
      openModal(e.state.modal);
    }
  }
});
checkModalAlreadyOpen();

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/sw.js", {
      scope: ".",
    })
    .then(function (registration) {
      console.log("Service Worker registered with scope:", registration.scope);

      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          console.log("Permission de notification accordée.");

          registration.pushManager
            .subscribe({
              userVisibleOnly: true,
              applicationServerKey:
                "BFs-mhV_ILjmQ-f0OvhSsbUozBKQZCV9gEACp2m9hrSYi-gfkK7m-fx6hz55G2qeRNYJxAw_EQ6nAmvYCijhi7k",
            })
            .then(function (subscription) {
              fetch("/subscribe", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(subscription),
              });
            });
        } else {
          console.log("Permission de notification refusée.");
        }
      });
    })
    .catch(function (error) {
      console.log("Service Worker registration failed:", error);
    });
}
