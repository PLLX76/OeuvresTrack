const generalSettingsFields = document
  .getElementById("settings-general")
  .getElementsByClassName("settings-field");

let havetoUpdateList = false;

async function initSettings() {
  let settings = await sendGetRequest("/api/settings");

  if (settings) {
    for (const field of generalSettingsFields) {
      fieldInput = field.querySelector("input");
      if (fieldInput) {
        field_key = fieldInput.dataset.key;
        if (field_key in settings) {
          field.querySelector("input").checked = settings[field_key];
        }
      }
    }
    setLexicon(settings.lexicon);

    initializeDraggables();
  }
}
function initializeDraggables() {
  const draggables = document.querySelectorAll(".settings-dictionary");
  const container = document.querySelector("#settings-dictionary-container");
  let draggedElement = null;
  let touchOffsetY = 0;

  draggables.forEach((draggable) => {
    draggable.addEventListener("dragstart", (e) => {
      draggable.classList.add("dragging");
      draggedElement = draggable;
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
      sendLexicon();
      draggedElement = null;
    });
  });

  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (draggedElement) {
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
    }
  });

  // Gestion du Drag & Drop pour mobile (touch events)
  draggables.forEach((draggable) => {
    draggable.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      touchOffsetY = touch.clientY - draggable.getBoundingClientRect().top;
      draggable.classList.add("dragging");
      draggedElement = draggable;
    });

    draggable.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const afterElement = getDragAfterElement(
        container,
        touch.clientY - touchOffsetY
      );
      if (draggedElement) {
        if (afterElement == null) {
          container.appendChild(draggedElement);
        } else {
          container.insertBefore(draggedElement, afterElement);
        }
      }
    });

    draggable.addEventListener("touchend", () => {
      draggable.classList.remove("dragging");
      draggedElement = null;

      sendLexicon();
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".settings-dictionary:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/**
 * Envoie une requête GET à l'endpoint donné
 * @param {String} endpoint URL de l'endpoint
 * @returns {Promise<Object>} promesse qui se résout avec les données de la réponse
 */
function sendGetRequest(endpoint) {
  return fetch(endpoint)
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
      console.error("Erreur lors de la création du compte :", error);
    });
}
/**
 * Envoie une requête POST à l'endpoint donné
 * @param {Object} data données à envoyer
 * @param {String} endpoint URL de l'endpoint
 * @returns {Promise<Object>} promesse qui se résout avec les données de la réponse
 */
function sendPostRequest(data, endpoint) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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

function initListenerSettings() {
  const editUsername = document.getElementById("edit-username");
  const editEmail = document.getElementById("edit-email");
  const editUsernameImg = editUsername.querySelector("img");
  const editEmailImg = editEmail.querySelector("img");

  const editUsernameInput = document.getElementById("settings-username");
  const editEmailInput = document.getElementById("settings-email");

  const settingsAccountError = document.getElementById(
    "settings-account-error"
  );
  const settingsAccountSuccess = document.getElementById(
    "settings-account-success"
  );

  editUsername.addEventListener("click", async () => {
    if (editUsernameImg.src.includes("edit.svg")) {
      editUsernameInput.disabled = false;
      editUsernameImg.src = "/static/icons/save.svg";
    } else {
      editUsernameInput.disabled = true;
      editUsernameImg.src = "/static/icons/edit.svg";

      let data = await sendPostRequest(
        { name: editUsernameInput.value },
        "/api/user"
      );
      if (data.status != "success") {
        settingsAccountError.innerText = "Erreur : " + data.error;
        settingsAccountSuccess.innerText = "";
      } else {
        settingsAccountError.innerText = "";
        settingsAccountSuccess.innerText = "Nom mis à jour.";
      }
    }
  });
  editEmail.addEventListener("click", async () => {
    if (editEmailImg.src.includes("edit.svg")) {
      editEmailInput.disabled = false;
      editEmailImg.src = "/static/icons/save.svg";
    } else {
      editEmailInput.disabled = true;
      editEmailImg.src = "/static/icons/edit.svg";

      let data = await sendPostRequest(
        { email: editEmailInput.value },
        "/api/user"
      );
      if (data.status != "success") {
        settingsAccountError.innerText = "Erreur : " + data.error;
        settingsAccountSuccess.innerText = "";
      } else {
        settingsAccountError.innerText = "";
        settingsAccountSuccess.innerText = "Email mis à jour.";
      }
    }
  });

  const settingTheme = document.getElementById("settings-theme");
  settingTheme.value = originalTheme;

  settingTheme.addEventListener("change", () => {
    changeTheme(settingTheme.value);
  });

  for (let i = 0; i < generalSettingsFields.length; i++) {
    let checkbox = generalSettingsFields[i].querySelector("input");
    if (checkbox) {
      checkbox.addEventListener("change", async () => {
        let data = await sendGetRequest(
          "/api/settings/" + checkbox.dataset.key + "/" + checkbox.checked
        );
        if (checkbox.dataset.key == "ignore-overs") {
          havetoUpdateList = true;
        }
        if (data.status != "success") {
          checkbox.checked = data.value;
          settingsAccountError.innerText =
            "Erreur lors de la mise à jour des paramètres veuillez reesayer.";
          settingsAccountSuccess.innerText = "";
        } else {
          settingsAccountError.innerText = "";
        }
      });
    }
  }
  const passwordSave = document.getElementById("password-save");
  const passwordOld = document.getElementById("settings-oldpass");
  const passwordNew = document.getElementById("settings-newpass");
  const passwordConfirm = document.getElementById("settings-confirmpass");
  passwordSave.addEventListener("click", async () => {
    if (
      passwordOld.value == "" ||
      passwordNew.value == "" ||
      passwordConfirm.value == ""
    ) {
      settingsAccountError.innerText =
        "Veuillez remplir tous les champs pour changer de mot de passe.";
      return;
    } else if (passwordNew.value != passwordConfirm.value) {
      settingsAccountError.innerText =
        "Les mots de passe ne correspondent pas.";
      return;
    }
    let data = await sendPostRequest(
      {
        oldPassword: passwordOld.value,
        newPassword: passwordNew.value,
        confirmPassword: passwordConfirm.value,
      },
      "/api/user/password"
    );
    if (data.status != "success") {
      settingsAccountError.innerText = "Erreur : " + data.error;
      settingsAccountSuccess.innerText = "";
    } else {
      settingsAccountError.innerText = "";
      settingsAccountSuccess.innerText = "Mot de passe mis à jour.";
    }
    passwordOld.value = "";
    passwordNew.value = "";
    passwordConfirm.value = "";
  });

  initListenerLexicon();
}

function initListenerLexicon() {
  const lexiconContainer = document.getElementById(
    "settings-dictionary-container"
  );
  lexiconContainer.addEventListener("change", (event) => {
    sendLexicon();
  });

  const deleteLexicon = document.getElementsByClassName("delete-lexicon");
  for (let i = 0; i < deleteLexicon.length; i++) {
    deleteLexicon[i].addEventListener("click", (event) => {
      event.target.parentNode.parentNode.remove();
      sendLexicon();
    });
  }

  const settingsDictionarySelects = document.getElementsByClassName(
    "settings-dictionary-select"
  );
  for (let i = 0; i < settingsDictionarySelects.length; i++) {
    settingsDictionarySelects[i].addEventListener("change", (event) => {
      settingsDictionarySelects[i].parentNode.querySelector("p").innerText =
        description[settingsDictionarySelects[i].value];

      console.log(settingsDictionarySelects[i]);
    });
  }
}

function sendLexicon() {
  sendPostRequest(getLexicon(), "/api/lexicon");
  havetoUpdateList = true;
}

function getLexicon() {
  const lexiconContainer = document.getElementById(
    "settings-dictionary-container"
  );
  const lexiconElements = lexiconContainer.children;
  let lexicon = new Object();

  let position = 0;
  for (const element of lexiconElements) {
    position++;

    let disabled = !element.querySelector("input[type=checkbox]").checked;
    let text = element.querySelector("input[type=text]").value;
    let key = element.querySelector("select").value;

    if (text == "") {
      position--;
      continue;
    }
    if (lexicon[key] == undefined) lexicon[key] = new Array();

    if (disabled)
      lexicon[key].push({ text: text, position: position, disabled: disabled });
    else lexicon[key].push({ text: text, position: position });
  }

  return lexicon;
}
const description = {
  OnGiveUp:
    "Ne prend pas d'argument. \nSe déclenche lorsque l'élément est abandonné",
  OnFinishStatus:
    "Ne prend pas d'argument. \nSe déclenche lorsque l'élément est fini",
  OnTitle: "Prend en position 0 : le titre. \nSe déclenche lors du titre",
  OnUnfinishedSeason:
    "Prend en position 0 : le numéro de la saison. \nSe déclenche lorsque une saison n'est pas finie (série uniquement)",
  OnFinishSeason:
    "Prend en position 0 : le numéro de la saison. \nSe déclenche lorsque la saison est finie (série uniquement)",
  OnStartedSeason:
    "Prend en position 0 : le numéro de la saison. \nSe déclenche lorsque la saison est commencée (série uniquement)",
  OnTome:
    "Prend en position 0 : le numéro du dernier tome lu. \nPrend en position 1 : le numéro de tome total. \nSe déclenche lorsque c'est un livre",
  OnEpisode:
    "Prend en position 0 : le numéro du dernier épisode regardé sur la dernière saison.\nSe déclenche lorsque c'est une série",
  OnRank:
    "Prend en position 0 : la note. \nSe déclenche lorsque l'utilisateur met une note",
  OnUnFinishedRelease:
    "Ne prend pas d'argument. \nSe déclenche lorsque l'element est pas fini de sortir (série uniquement)",
};
function setLexicon(lexicon) {
  const lexiconContainer = document.getElementById(
    "settings-dictionary-container"
  );
  lexiconContainer.innerHTML = "";

  const options = [
    { value: "OnFinishStatus", label: "Lorsque l'état est fini" },
    { value: "OnTitle", label: "Lors du titre" },
    { value: "OnUnfinishedSeason", label: "Lors d'une saison non finie" },
    { value: "OnFinishSeason", label: "Lorsque la saison est finie" },
    { value: "OnStartedSeason", label: "Lorsqu'une saison est commencée" },
    { value: "OnTome", label: "Lors d'un tome" },
    { value: "OnEpisode", label: "Lors du dernier épisode" },
    { value: "OnRank", label: "Lors de la note" },
    { value: "OnGiveUp", label: "Lorsque c'est abandonné" },
    { value: "OnUnFinishedRelease", label: "Lorsque c'est pas fini de sortir" },
  ];

  const createOptionElement = (key) => {
    return options
      .map(
        (opt) =>
          `<option value="${opt.value}" ${
            opt.value === key ? "selected" : ""
          }>${opt.label}</option>`
      )
      .join("");
  };

  const lexiconChildren = [];

  // Ensure 'elements' is an array before applying 'map'
  Object.entries(lexicon).forEach(([key, elements]) => {
    if (Array.isArray(elements)) {
      elements.forEach((element) => {
        const newElement = document.createElement("div");
        newElement.classList.add("settings-dictionary");
        newElement.draggable = true;

        const checked = element.disabled !== true ? "checked" : "";

        newElement.innerHTML = `
          <img alt="Drag icon" src="/static/icons/drag_indicator.svg" draggable="true">
          <input class="settings-dictionary-checkbox" title="activer/desactiver" type="checkbox" ${checked} name="lexicon-checkbox">
          <input type="text" class="settings-dictionary-text" value="${
            element.text
          }" name="lexicon-text">
          <select class="settings-dictionary-select" name="lexicon-select">
            ${createOptionElement(key)}
          </select>
          <img alt="Info icon" src="/static/icons/info.svg" class="info-icon">
          <p>${description[key]}</p>
          <button class="delete-lexicon" title="Supprimer cette ligne">
            <img alt="Delete icon" src="/static/icons/delete.svg">
          </button>
        `;

        lexiconChildren.push({
          position: element.position,
          element: newElement,
        });
      });
    } else {
      console.error(`Expected an array for key '${key}', but got:`, elements);
    }
  });

  lexiconChildren.sort((a, b) => a.position - b.position);
  lexiconChildren.forEach(({ element }) =>
    lexiconContainer.appendChild(element)
  );
}
function addLexiconLine() {
  const lexiconContainer = document.getElementById(
    "settings-dictionary-container"
  );
  const newElement = document.createElement("div");
  newElement.classList.add("settings-dictionary");
  newElement.draggable = true;
  newElement.innerHTML = `
    <img alt="Drag icon" src="/static/icons/drag_indicator.svg" draggable="true">
    <input class="settings-dictionary-checkbox" title="activer/desactiver" type="checkbox" checked>
    <input type="text" class="settings-dictionary-text">
    <select class="settings-dictionary-select">
      <option value="OnTitle" selected>Lors du titre</option>
      <option value="OnUnfinishedSeason">Lors d'une saison non finie</option>
      <option value="OnFinishSeason">Lorsque la saison est finie</option>
      <option value="OnStartedSeason">Lorsqu'une saison est commencée</option>
      <option value="OnTome">Lors d'un tome</option>
      <option value="OnEpisode">Lors du dernier épisode</option>
      <option value="OnRank">Lors de la note</option>
      <option value="OnGiveUp">Lorsque c'est abandonné</option>
      <option value="OnUnFinishedRelease">Lorsque c'est pas fini de sortir</option>
    </select>
    <img alt="Info icon" src="/static/icons/info.svg" class="info-icon">
    <p>Prend en position 0 : le titre. </br>Se déclenche lors du titre</p>
    <button class="delete-lexicon" title="Supprimer cette ligne">
      <img alt="Delete icon" src="/static/icons/delete.svg">
    </button>
  `;
  lexiconContainer.appendChild(newElement);

  newElement.addEventListener("change", (event) => {
    sendLexicon();
  });
  newElement
    .querySelector(".delete-lexicon")
    .addEventListener("click", (event) => {
      event.target.parentNode.parentNode.remove();
      sendLexicon();
    });
  newElement
    .querySelector(".settings-dictionary-select")
    .addEventListener("change", (event) => {
      newElement
        .querySelector(".settings-dictionary-select")
        .parentNode.querySelector("p").innerText =
        description[
          newElement.querySelector(".settings-dictionary-select").value
        ];
    });

  initializeDraggables();
}

initSettings();
initListenerSettings();
