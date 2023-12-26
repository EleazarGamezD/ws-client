import './style.css'

import { connectToServer } from './socket-client.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h2>WebSocket - Client</h2>

    <input id="jwt-token" placeholder="Json Web Token" />
    <button id="btn-connect">Connect</button>
    <br/>
    <spam id = "server-status">offline</spam>
    <ul id="clients-ul"></ul>
    <form id="message-form">
    <input placeholder="message" id="message-input"/>
    </form>
    <h3>Mensajes</h3>
    <ul id="messages-ul"></ul>
    </div>
`

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
// connectToServer()
const jwtToken = document.querySelector<HTMLInputElement>('#jwt-token')!
const btnConnect = document.querySelector<HTMLInputElement>('#btn-connect')!

btnConnect.addEventListener('click', () => {
  if (jwtToken.value.trim().length <= 0) return alert('enter a valid JWT')
  connectToServer(jwtToken.value)
})