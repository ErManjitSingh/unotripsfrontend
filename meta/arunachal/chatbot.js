/**
 * Arunachal Pradesh Tour Chatbot - fixed 3-step button flow.
 */
(function () {
  var CHAT_ENDPOINT = 'send_chat.php';
  var TYPING_DELAY = 900;

  var greetingMessage = 'Hello 👋\nWelcome to Arunachal Pradesh Tour.\nLet us help you quickly.';

  var steps = [
    {
      id: 'destination',
      text: 'Which Arunachal trip are you looking for?',
      options: ['Tawang', 'Ziro Valley', 'Bomdila', 'Dirang', 'Suggest best package']
    },
    {
      id: 'timeline',
      text: 'When are you planning to travel?',
      options: ['Within 15 days', 'Next month', 'Later', 'Just checking prices']
    },
    {
      id: 'contact',
      text: 'Please share your mobile number so our travel expert can contact you.',
      inputType: 'mobile'
    }
  ];

  var transcript = [];
  var currentIndex = -1;
  var userMobile = '';
  var widget = document.getElementById('chatbot-widget');
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
        if (inputWrap) inputWrap.style.display = 'none';

        currentIndex++;
        if (currentIndex < steps.length) {
          setTimeout(function () { askNext(); }, 350);
        } else {
          sendChatAndThankYou();
        }
      });
      quickRepliesEl.appendChild(btn);
    });
  }

  function askNext() {
    if (currentIndex >= steps.length) {
      sendChatAndThankYou();
      return;
    }
    var q = steps[currentIndex];
    if (q.inputType === 'mobile') {
      showTypingIndicator(function () {
        addMessage('bot', q.text);
        quickRepliesEl.innerHTML = '';
        if (inputWrap) inputWrap.style.display = 'flex';
        if (userInput) {
          userInput.value = '';
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
    if (inputWrap) inputWrap.style.display = 'none';
    showTypingIndicator(function () {
      addMessage('bot', 'Thank you! Our travel expert will connect with you shortly. 🙏');
      sendChatToServer();
    });
  }

  function sendChatToServer() {
    var payload = {
      chat: JSON.stringify(transcript),
      user_name: '',
      user_email: '',
      user_phone: userMobile || '',
      destination: 'Arunachal'
    };
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
    xhr.send(JSON.stringify(payload));
  }

  function startChat() {
    transcript = [];
    currentIndex = -1;
    userMobile = '';
    if (messagesEl) messagesEl.innerHTML = '';
    quickRepliesEl.innerHTML = '';
    if (inputWrap) inputWrap.style.display = 'none';
    if (userInput) {
      userInput.value = '';
      userInput.placeholder = 'Type your answer...';
      userInput.type = 'text';
    }

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
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  if (userInput && sendBtn) {
    function submitMobile() {
      var text = (userInput.value || '').trim();
      if (!text) return;
      var q = steps[currentIndex];
      if (!q || q.inputType !== 'mobile') return;

      var digits = text.replace(/\D/g, '');
      if (digits.length < 10) {
        addMessage('bot', 'Please enter a valid mobile number.');
        return;
      }

      userMobile = text;
      addMessage('user', text);
      userInput.value = '';
      if (inputWrap) inputWrap.style.display = 'none';
      sendChatAndThankYou();
    }

    sendBtn.addEventListener('click', submitMobile);
    userInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitMobile();
      }
    });
  }
})();
