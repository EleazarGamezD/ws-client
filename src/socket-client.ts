import { Manager, Socket } from 'socket.io-client';

let socket: Socket;
let currentChatId: string;
interface Message {
    chatId: string;
    isRead: boolean;
isReceived: boolean;
    content: string;
    createdAt: string;
    _id: string;
    sender:{
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    }
    recipient:{
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    }
}
export const connectToServer = (tokenUser: string, otherUserId: string, transactionId: string) => {
   
    const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
        extraHeaders: {
            Authorization: tokenUser
        }
    });
    const payload = { otherUserId, transactionId };
    socket = manager.socket('/comercialChat');

    socket.on('connect', () => {
        console.log('connected to server');       
        socket.emit('joinChat', payload);
    });

    socket.on('disconnect', () => {
        console.log('disconnected from server');
    });


    addListeners();
};

const addListeners = () => {
    
    const serverStatusLabel = document.querySelector('#server-status')!;
    const chatIdLabel = document.querySelector('#chat-id')!
    const clientsUl = document.querySelector('#clients-ul')!;
    const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;
    const formMessage = document.querySelector<HTMLFormElement>('#message-form')!;
    const inputMessage = document.querySelector<HTMLInputElement>('#message-input')!;
    const userToConnectId = document.querySelector<HTMLInputElement>('#userToConnectId')!
    socket.on('connect', () => {
        serverStatusLabel.innerHTML = 'connected';
    });
    
    socket.on('disconnect', () => {
        serverStatusLabel.innerHTML = 'disconnected';
    });
    socket.on('joinedChat',(chatId:{chatId: string})=>{   
        console.log(chatId) 
        const newMessage = ` 
        <h5>ID del chat</h5>   
        <strong>${chatId.chatId}</strong>
           
        `;
        currentChatId = chatId.chatId
        chatIdLabel.innerHTML = newMessage
    })

  socket.on('clients-updated', (clients: string[]) => {
        let clientsHtml = '';
        clients.forEach(clientId => {
            clientsHtml += `<li>${clientId}</li>`;
        });
        clientsUl.innerHTML = clientsHtml;
    });

    formMessage.addEventListener('submit', (event) => {
        event.preventDefault();
        if (inputMessage.value.trim().length <= 0) return;
       
        socket.emit('sendMessage', {
            content: inputMessage.value, chatId: currentChatId, recipient:userToConnectId.value           
        });

        inputMessage.value = '';
    });

    socket.on('restoreMessages', (messages: Message[]) => {   
        const messagesJson = JSON.stringify(messages, null, 2); // null es para no aplicar un replacer, y 2 es el espacio de indentación    
        console.log("Messages in JSON format:");
        console.log(messagesJson);
        messages.forEach((message: Message) => {
            console.log(message.recipient._id);
            const userFullName = message.recipient._id === userToConnectId.value ? `${message.recipient.firstName} ${message.recipient.lastName}` : `${message.sender.firstName} ${message.sender.lastName}`;
            const formatDate = new Date(message.createdAt).toLocaleString();
    
            const receivedStatus = message.isReceived ? '✓' : '';
            const readStatus = message.isRead ? '✓' : '';
    
            const newMessage = `
                <li id="${message._id}" class="${message.sender._id === userToConnectId.value ? 'my-message' : 'other-message'}">
                    <strong>${userFullName}</strong>
                    <span>${message.content}</span>
                    <span>${formatDate}</span>
                    <span class="message-status">${receivedStatus}${readStatus}</span>
                </li>`;
    
            messagesUl.insertAdjacentHTML('beforeend', newMessage);   
       
        });
    });
    
    
    socket.on('message', (message: Message) => {
        console.log(message);
        const userFullName = `${message.sender.firstName} ${message.sender.lastName}`;
        const formatDate = new Date(message.createdAt).toLocaleString();
        
        // Aquí determinamos si el mensaje es del usuario actual o del otro usuario
        const isMyMessage = message.sender._id === userToConnectId.value;
    
        // Construimos los elementos de estado para isReceived y isRead
        const receivedStatus = message.isReceived ? '✓' : '';
        const readStatus = message.isRead ? '✓' : '';
    
        const newMessage = `
            <li id="${message._id}" class="${isMyMessage ? 'my-message' : 'other-message'}">
                <strong>${userFullName}</strong>
                <span>${message.content}</span>
                <span>${formatDate}</span>
                <span class="message-status">${receivedStatus}${readStatus}</span>
            </li>`;
        
        messagesUl.insertAdjacentHTML('beforeend', newMessage);    
 
    });

    socket.on('messageStatusUpdated', (statusUpdate: { messageId: string, isReceived?: boolean, isRead?: boolean }) => {
        const messageElement = document.getElementById(statusUpdate.messageId);
        if (messageElement) {
            const statusSpan = messageElement.querySelector('.message-status');
            if (statusSpan) {
                let statusText = '';
                if (statusUpdate.isRead) {
                    statusText = '✓✓';
                } else if (statusUpdate.isReceived) {
                    statusText = '✓';
                }
                statusSpan.textContent = statusText;
            }
        }
    });
    
    messagesUl.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
    
        // Aquí verificamos si el clic fue en un mensaje específico (elemento <li>)
        if (target.tagName === 'LI') {
            const messageId = target.getAttribute('id');
            if (messageId) {
                // Notificar al servidor que el mensaje ha sido leído
                socket.emit('messageRead', { messageId: messageId, chatId: currentChatId });
    
                // Actualizamos visualmente el estado del mensaje a leído
                const statusSpan = target.querySelector('.message-status');
                if (statusSpan) {
                    statusSpan.textContent = '✓✓';
                }
            }
        }
    }); 
};
