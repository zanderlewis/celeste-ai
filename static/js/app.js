const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatHistory = document.getElementById('chat-history');

// DOM content loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch history from backend
    const response = await fetch('/history');
    const history = await response.json();

    // Append chat history to chat history container
    for (const message of history) {
        const messageElement = document.createElement('div');
        if (message.role === 'user') {
            messageElement.className = 'bg-blue-300 p-2 rounded mb-2 text-gray-800';
        } else {
            messageElement.className = 'bg-gray-900 p-2 rounded mb-2 text-gray-300';
        }
        // Make a post request to markup the message
        const markupResponse = await fetch('/markup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: message.content }) // Ensure the key is 'text'
        });
        const data = await markupResponse.json();
        messageElement.innerHTML = data.markup;
        chatHistory.appendChild(messageElement); // Append the message element to chat history
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (!message) return;

    // Append user message to chat history
    const userMessage = document.createElement('div');
    userMessage.className = 'bg-blue-300 p-2 rounded mb-2 text-gray-800';
    userMessage.textContent = message;
    chatHistory.appendChild(userMessage);

    // Clear input
    messageInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Markup the user message
    const r = await fetch('/markup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: message }) // Ensure the key is 'text'
    });
    const d = await r.json();
    userMessage.innerHTML = d.markup;

    // Send message to backend and handle streaming response
    const response = await fetch('/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    // Create a single bot message element
    const botMessage = document.createElement('div');
    botMessage.className = 'bg-gray-900 p-2 rounded mb-2 text-gray-300';
    chatHistory.appendChild(botMessage);

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        // Append chunk to the existing bot message element
        const chunkElement = document.createElement('span');
        chunkElement.className = 'fade-in';
        chunkElement.innerHTML = chunk;
        botMessage.appendChild(chunkElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    const markupResponse = await fetch('/markup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: botMessage.textContent }) // Ensure the key is 'text'
    });
    const data = await markupResponse.json();
    botMessage.innerHTML = data.markup;
    chatHistory.scrollTop = chatHistory.scrollHeight;
});