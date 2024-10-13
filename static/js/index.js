const loginBtn = document.getElementById("login-btn");
const closeModalLogin = document.getElementById("close-modal-login");
const modalBack = document.getElementById("modal-back");
const modalLogin = document.getElementById("modal-login");

loginBtn.addEventListener("click", () => {
  modalLogin.classList.add("open");
});

function closeModal() {
  modalLogin.classList.remove("open");
}

closeModalLogin.addEventListener("click", closeModal);
modalBack.addEventListener("click", closeModal);

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
window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});
