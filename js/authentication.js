// Botões
var authEmailPassButton = document.getElementById('authEmailPassButton');
var authFacebookButton = document.getElementById('authFacebookButton');
var authTwitterButton = document.getElementById('authTwitterButton');
var authGoogleButton = document.getElementById('authGoogleButton');
var authGitHubButton = document.getElementById('authGitHubButton');
var authAnonymouslyButton = document.getElementById('authAnonymouslyButton');
var createUserButton = document.getElementById('createUserButton');
var logOutButton = document.getElementById('logOutButton');

// inputs
var emailInput = document.getElementById('emailInput');
var passwordInput = document.getElementById('passwordInput');

// Display
var displayMsg = document.getElementById('displayMsg');

// Criar novo usuário Email e Senha
createUserButton.addEventListener('click', function () {
    firebase
        .auth()
        .createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(function (){
            alert("Bem vindo " + emailInput.value);
        })
        .catch(function (error) {
          console.error(error.code);
          console.error(error.message);
          alert("Falha ao cadastrar, verifique o erro no console.");
        });
});

// Autenticar com E-mail e senha
authEmailPassButton.addEventListener('click', function () {
    firebase
        .auth()
        .signInWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(function (result) {
          console.log(result);
          displayMsg.innerText = "Bem vindo, " + emailInput.value;
          alert("Autenticado " + emailInput.value);
        })
        .catch(function (error) {
          console.error(error.code);
          console.error(error.message);
          alert("Falha ao autenticar, verifique o erro no console.");
        });
});

// Logout
logOutButton.addEventListener('click', function () {
    firebase
        .auth()
        .signOut()
        .then(function () {
            displayMsg.innerText = "Você não está autenticado";
            alert("Você se deslogou");
        }, function (error) {
            console.error(error);
        });
});

// Autenticar Anônimo
authAnonymouslyButton.addEventListener('click', function () {
    firebase
        .auth()
        .signInAnonymously()
        .then(function (result) {
            console.log(result);
            displayMsg.innerText = "Bem vindo, desconhecido";
            alert("Autenticado Anonimamente");
        })
        .catch(function (error){
          console.error(error.code);
          console.error(error.message);

        });
});

// Autenticar com GitHub
authGitHubButton.addEventListener('click', function () {
    // Providers
    var provider = new firebase.auth.GithubAuthProvider();
    signIn(provider);
});

function signIn(provider) {
    firebase.auth()
        .signInWithPopup(provider) // pode ser usado sign com Popup ou redirect
        .then(function (result) {
          console.log(result);
          var token = result.credential.accessToken;
          displayMsg.innerText = "Bem vindo, " + result.user.displayMsg;
        }).catch(function (error) {
          console.log(error);
            alert("Falha na autenticação");
          });
}
