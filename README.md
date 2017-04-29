nelsonmartins.io
Aplicação com Firebase


Git:
// Sua Identidade
// A primeira coisa que você deve fazer quando instalar o Git é definir
// o seu nome de usuário e endereço de e-mail. Isso é importante porque
// todos os commits no Git utilizam essas informações, e está
// imutavelmente anexado nos commits que você realiza:
git config --global user.name "nelsontecti"
git config --global user.email nelsontecti@gmail.com


// Exibe todos os apontamentos de usuarios urls etc.
git config --list


// No gitbash para inicializar um repositorio
git init


// Adiciona a url do repositorio
git remote add origin https://github.com/martinsnelson/martinsnelson.github.io.git



// Para adicionar todos arquivos a uma ara que chamamos de stage
// onde os arquivos tao sendo ouvidos pelo servidor web
git add .


// Detecta novos arquivos e seus status e avisao se
// algum sera sobre escrito
git status


// git commit -m "Msg" commita e coloca uma mensagem no comnit
git commit -m "MSG"


// Envia de fato para o github obs:branch e chamado de ramo
// em portugues
git push origin master
