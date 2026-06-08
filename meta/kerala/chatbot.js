/**
 * Kerala Tour Chatbot - 3 steps only.
 * Step 1: Destination (buttons) → Step 2: Travel timeline (buttons) → Step 3: Contact → Thank you & close
 */
(function () {
  var CHAT_ENDPOINT = 'send_chat.php';
  var TYPING_DELAY = 1200;
  var CLOSE_AFTER_THANKYOU_MS = 2500;

  var greetingMessage = 'Hello 👋\nWelcome to our Kerala Tour Services.\nI will help you plan your perfect trip.';

  var questions = [
    { id: 'dest', text: 'Which Kerala trip are you looking for?', options: ['Munnar', 'Alleppey', 'Thekkady', 'Kovalam', 'Suggest best package'] },
    { id: 'timeline', text: 'Planning to travel?', options: ['Within 15 days', 'Next month', 'Later', 'Just checking prices'] },
    { id: 'contact', text: 'Please share your contact number so our travel expert can get in touch with the best package.', inputType: 'mobile' }
  ];

  var transcript = [];
  var currentIndex = -1;
  var userMobile = '';
  var lastSentTranscript = '';
  var widget = document.getElementById('chatbot-widget');
  var panel = document.getElementById('chatbot-panel');
  var messagesEl = document.getElementById('chatbot-messages');
  var quickRepliesEl = document.getElementById('chatbot-quick-replies');
  var inputWrap = document.getElementById('chatbotInputWrap');
  var userInput = document.getElementById('chatbotUserInput');
  var sendBtn = document.getElementById('chatbotSend');
  var toggleBtn = document.getElementById('chatbotToggle');
  var closeBtn = document.getElementById('chatbotClose');

  function openChat() {
    if (widget) widget.classList.add('open');
  }

  function closeChat() {
    if (widget) widget.classList.remove('open');
  }

  function showTypingIndicator(callback) {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-wrap chatbot-msg-wrap-bot';
    var bubble = document.createElement('div');
    bubble.className = 'chatbot-msg bot chatbot-typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(bubble);
    if (messagesEl) {
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      if (callback) callback();
    }, TYPING_DELAY);
  }

  function addMessage(who, text) {
    transcript.push({ who: who, text: text });
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg-wrap chatbot-msg-wrap-' + who + ' chatbot-msg-appear';
    var div = document.createElement('div');
    div.className = 'chatbot-msg ' + who;
    div.textContent = text;
    wrap.appendChild(div);
    if (messagesEl) {
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function showQuickReplies(options) {
    quickRepliesEl.innerHTML = '';
    options.forEach(function (label) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chatbot-quick-reply';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        quickRepliesEl.innerHTML = '';
        addMessage('user', label);
        inputWrap.style.display = 'none';
        currentIndex++;
        if (currentIndex < questions.length) {
          setTimeout(function () { askNext(); }, 400);
        } else {
          sendChatAndThankYou();
        }
      });
      quickRepliesEl.appendChild(btn);
    });
  }

  function askNext() {
    if (currentIndex >= questions.length) {
      sendChatAndThankYou();
      return;
    }
    var q = questions[currentIndex];
    if (q.inputType === 'mobile') {
      showTypingIndicator(function () {
        addMessage('bot', q.text);
        quickRepliesEl.innerHTML = '';
        inputWrap.style.display = 'flex';
        if (userInput) {
          userInput.placeholder = 'e.g. 9876543210';
          userInput.type = 'tel';
          userInput.focus();
        }
      });
      return;
    }
    showTypingIndicator(function () {
      addMessage('bot', q.text);
      showQuickReplies(q.options || []);
    });
  }

  function sendChatAndThankYou() {
    quickRepliesEl.innerHTML = '';
    inputWrap.style.display = 'none';
    showTypingIndicator(function () {
      addMessage('bot', 'Thank you! 🙏 Our travel expert will contact you soon with the best package. Have a great day!');
      sendChatToServer();
      setTimeout(function () { closeChat(); }, CLOSE_AFTER_THANKYOU_MS);
    });
  }

  function hasUserMessage() {
    return transcript.some(function (m) { return m.who === 'user'; });
  }

  function sendChatToServer(useBeacon) {
    if (!hasUserMessage()) return;
    var snapshot = JSON.stringify(transcript);
    if (snapshot === lastSentTranscript) return;
    lastSentTranscript = snapshot;

    var payload = {
      chat: JSON.stringify(transcript),
      user_name: '',
      user_email: '',
      user_phone: userMobile || ''
    };
    var payloadStr = JSON.stringify(payload);

    if (useBeacon && navigator.sendBeacon) {
      var url = new URL(CHAT_ENDPOINT, window.location.href).href;
      navigator.sendBeacon(url, new Blob([payloadStr], { type: 'application/json' }));
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CHAT_ENDPOINT, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        try {
          var res = JSON.parse(xhr.responseText || '{}');
          if (!res.success) console.warn('Chat send:', res.message);
        } catch (e) {}
      }
    };
    xhr.send(payloadStr);
  }

  function startChat() {
    transcript = [];
    currentIndex = -1;
    userMobile = '';
    lastSentTranscript = '';
    if (messagesEl) messagesEl.innerHTML = '';
    quickRepliesEl.innerHTML = '';
    inputWrap.style.display = 'none';
    userInput.placeholder = 'Type your answer...';
    userInput.type = 'text';

    showTypingIndicator(function () {
      addMessage('bot', greetingMessage);
      currentIndex = 0;
      setTimeout(function () { askNext(); }, 500);
    });
  }

  if (toggleBtn) toggleBtn.addEventListener('click', function () {
    openChat();
    if (transcript.length === 0) startChat();
  });
  if (closeBtn) closeBtn.addEventListener('click', function () {
    sendChatToServer(false);
    closeChat();
  });

  // Agar user tab/browser band kare ya page chhode, to bhi mail bhejo (partial chat)
  function onPageLeave() {
    sendChatToServer(true);
  }
  window.addEventListener('beforeunload', onPageLeave);
  window.addEventListener('pagehide', onPageLeave);

  if (userInput && sendBtn) {
    function sendUserText() {
      var text = (userInput.value || '').trim();
      if (!text) return;
      userInput.value = '';
      userInput.placeholder = 'Type your answer...';
      userInput.type = 'text';
      addMessage('user', text);
      var q = questions[currentIndex];
      if (q && q.inputType === 'mobile') {
        userMobile = text.replace(/\s+/g, '');
        currentIndex++;
        sendChatAndThankYou();
        return;
      }
      currentIndex++;
      if (currentIndex < questions.length) {
        setTimeout(function () { askNext(); }, 400);
      } else {
        sendChatAndThankYou();
      }
    }
    sendBtn.addEventListener('click', sendUserText);
    userInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); sendUserText(); }
    });
  }
})();
