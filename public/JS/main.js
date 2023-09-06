const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// Pegar nome de usuário e sala da URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Entrar na sala
socket.emit("joinRoom", { username, room });

// Pegar sala e usuários
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Mensagem do servidor
socket.on("message", message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Pegando texto da mensagem
    const msg = e.target.elements.msg.value;

    // Emitindo mensagem para o servidor
    socket.emit("chatMessage", msg);

    // Limpa o campo de input do usuário
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

// 'Output' da mensagem para o DOM
function outputMessage(message)
{
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

// Adiciona nome da sala ao DOM
function outputRoomName(room)
{
    document.getElementById("room-name").innerText = room;
}

// Adiciona usuários ao DOM
function outputUsers(users)
{
    document.getElementById("users").innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}
