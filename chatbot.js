/**
 * Generation AI Chatbot - Frontend JavaScript
 */

(function($) {
    'use strict';
    
    const ChatBot = {
        isOpen: false,
        isTyping: false,
        
        init: function() {
            this.bindEvents();
            this.showWelcomeMessage();
        },
        
        bindEvents: function() {
            const self = this;
            
            // Öppna/stäng chatbot
            $('#gac-chatbot-button').on('click', function() {
                self.toggleChat();
            });
            
            $('#gac-chatbot-close').on('click', function() {
                self.closeChat();
            });
            
            // Skicka meddelande
            $('#gac-chatbot-send').on('click', function() {
                self.sendMessage();
            });
            
            // Enter-tangent för att skicka
            $('#gac-chatbot-input').on('keypress', function(e) {
                if (e.which === 13 && !e.shiftKey) {
                    e.preventDefault();
                    self.sendMessage();
                }
            });
        },
        
        toggleChat: function() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        },
        
        openChat: function() {
            $('#gac-chatbot-window').fadeIn(300);
            $('#gac-chatbot-input').focus();
            this.isOpen = true;
        },
        
        closeChat: function() {
            $('#gac-chatbot-window').fadeOut(300);
            this.isOpen = false;
        },
        
        showWelcomeMessage: function() {
            if (gacData.welcomeMessage) {
                this.addMessage(gacData.welcomeMessage, 'bot');
            }
        },
        
        addMessage: function(text, sender) {
            const messageHtml = `
                <div class="gac-message ${sender}">
                    <div class="gac-message-content">${this.escapeHtml(text)}</div>
                </div>
            `;
            
            $('#gac-chatbot-messages').append(messageHtml);
            this.scrollToBottom();
        },
        
        showTypingIndicator: function() {
            const typingHtml = `
                <div class="gac-message bot" id="gac-typing">
                    <div class="gac-typing-indicator">
                        <div class="gac-typing-dot"></div>
                        <div class="gac-typing-dot"></div>
                        <div class="gac-typing-dot"></div>
                    </div>
                </div>
            `;
            
            $('#gac-chatbot-messages').append(typingHtml);
            this.scrollToBottom();
            this.isTyping = true;
        },
        
        hideTypingIndicator: function() {
            $('#gac-typing').remove();
            this.isTyping = false;
        },
        
        sendMessage: function() {
            const $input = $('#gac-chatbot-input');
            const message = $input.val().trim();
            
            if (!message || this.isTyping) {
                return;
            }
            
            // Visa användarens meddelande
            this.addMessage(message, 'user');
            $input.val('');
            
            // Visa typing-indikator
            this.showTypingIndicator();
            
            // Skicka till backend
            $.ajax({
                url: gacData.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'gac_send_message',
                    nonce: gacData.nonce,
                    message: message
                },
                success: (response) => {
                    this.hideTypingIndicator();
                    
                    if (response.success) {
                        this.addMessage(response.data.message, 'bot');
                    } else {
                        this.addMessage('Ursäkta, något gick fel. Försök igen.', 'bot');
                    }
                },
                error: () => {
                    this.hideTypingIndicator();
                    this.addMessage('Kunde inte ansluta till servern. Kontrollera din internetanslutning.', 'bot');
                }
            });
        },
        
        scrollToBottom: function() {
            const $messages = $('#gac-chatbot-messages');
            $messages.scrollTop($messages[0].scrollHeight);
        },
        
        escapeHtml: function(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
    };
    
    // Initiera när DOM är redo
    $(document).ready(function() {
        ChatBot.init();
    });
    
})(jQuery);