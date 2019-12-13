window.onload = () => {
    const socket = io();

    const person = prompt('Hello! What is your name?');
    socket.emit('new user', person);

    const messages = document.querySelector('#messages');
    const typingMessages = document.querySelector('#typingMessages');
    const form = document.querySelector('#form');
    const input = document.querySelector('#m');
    
    let typing = false;
    const TYPING_TIMER_LENGTH = 400;

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage(input.value);
            input.value = '';
            return false;
        });

        input.addEventListener('input', () => {
            updateTyping();
        });
    }

    const cleanInput = (input) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = input;
        return tmp.textContent || tmp.innerText || "";
    }

    const updateTyping = () => {
        if (!typing) {
            typing = true;
            socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(() => {
            const typingTimer = (new Date()).getTime();
            const timeDiff = typingTimer - lastTypingTime;
            
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing');
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    }

    const sendMessage = message => {
        message = cleanInput(message);

        if (message) {
            addChatMessage({
                username: person,
                message: message
            });

            socket.emit('chat message', message);
        }
    }

    const addChatMessage = (data, options) => {
        options = options || {};

        removeChatTyping(data);

        const messageElement = document.createElement('li');
        const usernameContainer = document.createElement('span');
        usernameContainer.className = 'username';
        usernameContainer.innerHTML = `${data.username}: `;

        messageElement.innerHTML = data.message;
        messageElement.insertBefore(usernameContainer, messageElement.firstChild);

        addMessageElement(messageElement, options);
    }
    
    const addChatTyping = (data) => {
        const typingMessageElement = document.createElement('li');

        typingMessageElement.innerHTML = `${data.username} is typing...`;
        typingMessageElement.className = 'typingMessage';

        typingMessages.appendChild(typingMessageElement);
    }

    const removeChatTyping = (data) => {
        const messages = Array.from(document.getElementsByClassName('typingMessage'));
        messages.filter(message => {
            if (message.innerHTML.includes(data.username)) {
                typingMessages.removeChild(message);
            }
        });
    }

    const addParticipantsMessage = (data) => {
        let message = '';
        if (data.numUsers === 1) {
            message = 'There is 1 participant.';
        } else {
            message = `There are ${data.numUsers} participants.`
        }
        log(message);
    }

    const addMessageElement = (node, options) => {
        if (!options) {
            options = {};
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        if (options.prepend) {
            messages.insertBefore(node, messages.firstChild);
        } else {
            messages.appendChild(node);
        }
    }

    const log = (message, options) => {
        const node = document.createElement('li');
        node.className = 'log';
        node.innerHTML = message;
        addMessageElement(node, options);
    }








    socket.on('login', (data) => {
        const message = 'Welcome to Socket.IO chat';
        log(message, {
            prepend: true
        });
        addParticipantsMessage(data);
    })

    socket.on('user joined', data => {
        log(data.username + ' joined the chat room');
        addParticipantsMessage(data);
    });

    socket.on('chat message', data => {
        addChatMessage(data);
    });

    socket.on('typing', data => {
        addChatTyping(data);
    });

    socket.on('stop typing', data => {
        removeChatTyping(data);
    });

    socket.on('user left', data => {
        log(`${data.username} left the chat`);
        addParticipantsMessage(data);
        removeChatTyping(data);
    });
}