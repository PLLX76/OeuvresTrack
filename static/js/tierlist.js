function initializeDraggables() {
  const draggables = document.querySelectorAll(".draggable");
  const containers = document.querySelectorAll(".container");

  draggables.forEach((draggable) => {
    initializeButton(draggable);

    draggable.addEventListener("dragstart", () => {
      draggable.classList.add("dragging");
    });

    draggable.addEventListener("dragend", () => {
      draggable.classList.remove("dragging");
      sendRankUpdate(draggable);
    });

    // draggable.addEventListener("touchstart", (e) => {
    //   draggable.classList.add("dragging");
    //   e.preventDefault();
    // });

    // draggable.addEventListener("touchend", (e) => {
    //   draggable.classList.remove("dragging");
    //   const touch = e.changedTouches[0];
    //   const container = document
    //     .elementFromPoint(touch.clientX, touch.clientY)
    //     .closest(".container");

    //   draggable.dataset.rank = container.dataset.rank;

    //   if (container) {
    //     const afterElement = getDragAfterElement(container, touch.clientX);
    //     if (afterElement == null) {
    //       container.appendChild(draggable);
    //     } else {
    //       container.insertBefore(draggable, afterElement);
    //     }
    //   }

    //   sendRankUpdate(draggable);
    // });

    // draggable.addEventListener("touchmove", (e) => {
    //   e.preventDefault();
    //   const touch = e.touches[0];
    //   const container = document
    //     .elementFromPoint(touch.clientX, touch.clientY)
    //     .closest(".container");
    //   if (container) {
    //     const afterElement = getDragAfterElement(container, touch.clientX);
    //     if (afterElement == null) {
    //       container.appendChild(draggable);
    //     } else {
    //       container.insertBefore(draggable, afterElement);
    //     }
    //   }
    // });
  });

  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientX);
      const draggable = document.querySelector(".dragging");
      draggable.dataset.rank = container.dataset.rank;
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}
function initializeButton(button) {
  button.addEventListener("click", () => {
    openModalEdit(button.dataset.id, button.dataset.type);
  });
}
function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
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
function sendRankUpdate(draggable) {
  sendRank(
    draggable.dataset.type,
    draggable.dataset.id,
    draggable.dataset.rank
  );
  haveSentRank = true;
}

initializeDraggables();
