function initializeDraggables() {
  const draggables = document.querySelectorAll(".draggable");
  const containers = document.querySelectorAll(".container");

  // Gère le début et la fin du glissement pour chaque élément déplaçable
  draggables.forEach((draggable) => {
    initializeButton(draggable); // Attache l'événement click pour l'édition

    draggable.addEventListener("dragstart", () => {
      // Ajoute une classe pour styliser l'élément en cours de déplacement
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      // Retire la classe à la fin du déplacement
      draggable.classList.remove("dragging");
    });
  });

  // Gère les zones de dépôt
  containers.forEach((container) => {
    // Événement déclenché en continu lorsque l'élément est glissé AU-DESSUS du conteneur
    container.addEventListener("dragover", (e) => {
      e.preventDefault(); // Indispensable pour autoriser le "drop"

      const draggingElement = document.querySelector(".dragging");
      // Si l'élément glissé n'appartient pas déjà à ce conteneur, on le déplace
      if (draggingElement && draggingElement.parentNode !== container) {
        const afterElement = getDragAfterElement(container, e.clientX);
        if (afterElement == null) {
          container.appendChild(draggingElement);
        } else {
          container.insertBefore(draggingElement, afterElement);
        }
      }
    });

    // Événement déclenché lorsque l'élément est LÂCHÉ dans le conteneur
    container.addEventListener("drop", (e) => {
      e.preventDefault(); // Empêche le comportement par défaut du navigateur
      const draggable = document.querySelector(".dragging");
      if (draggable) {
        // Met à jour le rang de l'élément en fonction du nouveau conteneur
        draggable.dataset.rank = container.dataset.rank;

        // La position a déjà été mise à jour dans dragover,
        // on envoie la mise à jour au serveur
        sendRankUpdate(draggable);
      }
    });
  });
}

/**
 * Attache l'événement de clic pour ouvrir une modale d'édition.
 */
function initializeButton(button) {
  button.addEventListener("click", () => {
    openModalEdit(button.dataset.id, button.dataset.type);
  });
}

/**
 * Trouve l'élément le plus proche après la position du curseur pour l'insertion.
 * Cette fonction reste la même, car elle est logiquement correcte.
 * L'optimisation vient du fait de ne plus l'appeler aussi souvent si possible
 * ou de ne pas manipuler le DOM dans dragover.
 */
function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      // Cherche l'élément juste à droite du curseur
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

var haveSentRank = false;
/**
 * Envoie la mise à jour du rang au serveur.
 */
function sendRankUpdate(draggable) {
  const type = draggable.dataset.type;
  const id = draggable.dataset.id;
  const rank = draggable.dataset.rank;

  if (type && id) {
    sendRank(type, id, rank);
    haveSentRank = true; // pour signaler une mise a jour
  } else {
    console.error("Missing data attributes for rank update.", draggable);
  }
}

function applyFilterTierlist() {
  const draggables = document.querySelectorAll(".draggable");
  const allFiltres = Array.from(
    document.querySelectorAll("#filtres .selected")
  );

  const selectedTypeFiltres = allFiltres
    .map((f) => f.dataset.filtre)
    .filter((f) => ["tv", "movie", "book", "books"].includes(f));

  if (selectedTypeFiltres.includes("book")) {
    selectedTypeFiltres.push("books");
  }

  const selectedStatusFiltres = allFiltres
    .map((f) => f.dataset.filtre)
    .filter((f) => ["onwatch", "towatch", "done", "giveup"].includes(f));

  draggables.forEach((draggable) => {
    // check type
    if (
      selectedTypeFiltres.length == 0 ||
      selectedTypeFiltres.includes(draggable.dataset.type)
    ) {
      // check status
      if (
        selectedStatusFiltres.length == 0 ||
        selectedStatusFiltres.includes(draggable.dataset.status)
      ) {
        draggable.style.display = "block";
      } else {
        draggable.style.display = "none";
      }
    } else {
      draggable.style.display = "none";
    }
  });
}
