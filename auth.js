document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  

  document.getElementById("btnLogin").addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

     if (!email || !password) {
      showMessage("Preencha email e senha.", true);
      return;
    }

    showProgressBar();
    
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        hideProgressBar();
        showMessage("Login bem-sucedido!", false);
        setTimeout(() => window.location.href = "index2.html", 1000);
      })
      .catch(error => {
        hideProgressBar();
        showMessage("Erro no login: " + error.message);
      });
  });

  document.getElementById("btnRegister").addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

     if (!email || !password) {
      showMessage("Preencha email e senha.", true);
      return;
    }

    showProgressBar();

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        hideProgressBar();
        showMessage("Usuário registrado com sucesso!", false);
      })
      .catch(error => {
        hideProgressBar();
        showMessage("Erro no registro: " + error.message);
      });
  });
});


function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}


function showMessage(msg, isError = true) {
  const messageDiv = document.querySelector(".message");

  if (!messageDiv) return;

  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
  messageDiv.style.opacity = "1";

  if (isError) {
    messageDiv.classList.remove("success");
    messageDiv.classList.add("error");
  } else {
    messageDiv.classList.remove("error");
    messageDiv.classList.add("success");
  }

  // Fade out depois de 4 segundos
  setTimeout(() => {
    messageDiv.style.opacity = "0";
  }, 4000);

  // Remover a mensagem completamente após 5 segundos
  setTimeout(() => {
    messageDiv.style.display = "none";
    messageDiv.classList.remove("error", "success");
    messageDiv.textContent = "";
  }, 5000);
}

function showProgressBar() {
  const container = document.querySelector(".progress-bar-container");
  if (!container) return;
  container.style.display = "block";
}

function hideProgressBar() {
  const container = document.querySelector(".progress-bar-container");
  if (!container) return;
  container.style.display = "none";
}
