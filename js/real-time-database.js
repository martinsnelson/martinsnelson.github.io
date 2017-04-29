// Recebemos os dados do html
var usersList = document.getElementById('usersList');
var nameInput = document.getElementById('nameInput');
var ageInput = document.getElementById('ageInput');
var addButton = document.getElementById('addButton');

// Ao clicar no botão adicionamos valores do html a função create
addButton.addEventListener('click', function(){
    create(nameInput.value, ageInput.value);
});

// Função que insere os dados no banco
function create (name, age) {
    var dados = {
        nome: name,
        idade: age
    };
    // retorna os dados da collection users
    return firebase.database().ref().child('users').push(dados);
}

firebase.database().ref('users').on('value', function (snapshot) {
  usersList.innerHTML = '';
  snapshot.forEach(function (item) {
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(item.val().nome + ': ' + item.val().idade));
    usersList.appendChild(li);
  });
});

// Get == Select
// toda vez que for realizada uma alteração na database sera executado
// uma nova verificação para trazer os novos dados
// pegamos nosso userslist e setamos para vazio
// E para cada item que vem no snapshot nos criamos um novo elemento do tipo li
// insero um texto dentro do li criado anteriormente
