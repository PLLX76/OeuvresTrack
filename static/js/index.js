const loginBtn = document.getElementById("login-btn");
const closeModalLogin = document.getElementById("close-modal-login");
const modalBack = document.getElementById("modal-back");
const modalLogin = document.getElementById("modal-login");

loginBtn.addEventListener("click", () => {
  modalLogin.style.transform = "scale(1)";
  modalBack.style.display = "block";
});

closeModalLogin.addEventListener("click", () => {
  modalLogin.style.transform = "scale(0)";
  modalBack.style.display = "none";
});

const changeMode = document.getElementById("change-mode");
const modalLoginTitle = document.getElementById("modal-login-title");
const formLogin = document.getElementById("login");
const formRegister = document.getElementById("register");
changeMode.addEventListener("click", () => {
  const temp = changeMode.innerText;
  changeMode.innerText = modalLoginTitle.innerText;
  modalLoginTitle.innerText = temp;
  if (temp === "Se connecter") {
    formLogin.classList.add("open");
    formRegister.classList.remove("open");
  } else {
    formLogin.classList.remove("open");
    formRegister.classList.add("open");
  }
});

const errorP = document.getElementById("error");
function checkPasswords() {
  var password = document.getElementById("register-password").value;
  var confirmPassword = document.getElementById(
    "register-password-confirm"
  ).value;
  if (password != confirmPassword) {
    errorP.innerText = "Les mots de passe ne correspondent pas";
    return false;
  }
  return true;
}
if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/sw.js")
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
window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});
