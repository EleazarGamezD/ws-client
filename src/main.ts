import './style.css'

import { connectToServer } from './socket-client.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h2>WebSocket - Client</h2>
    <div id="chat-id"></div>
    <div class="form-group">   
      <input id="jwt-tokenUser" placeholder="Json Web Token User" />
      <input id="userToConnectId" placeholder="User that you want to connect" />
      <input id="transaction-id" placeholder="transaction Id" />
    </div>

    <button id="btn-connect">Connect</button>
    <br/>
    <span id="server-status">offline</span>
    <ul id="clients-ul"></ul>
    <form id="message-form">
      <input placeholder="message" id="message-input"/>
    </form>
    <h3>Mensajes</h3>
    <ul id="messages-ul"></ul>
  </div>
`;


// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
// connectToServer()
const jwtToken = document.querySelector<HTMLInputElement>('#jwt-tokenUser')!
const userToConnectId = document.querySelector<HTMLInputElement>('#userToConnectId')!
const transactionId = document.querySelector<HTMLInputElement>('#transaction-id')!
const btnConnect = document.querySelector<HTMLInputElement>('#btn-connect')!

btnConnect.addEventListener('click', () => {
  if (jwtToken.value.trim().length <= 0) return alert('enter a valid JWT')
  if (userToConnectId.value.trim().length <= 0) return alert('enter a valid userToConnectId')
  if (transactionId.value.trim().length <= 0) return alert('enter a valid transactionId')  
  connectToServer(jwtToken.value , userToConnectId.value, transactionId.value)
})