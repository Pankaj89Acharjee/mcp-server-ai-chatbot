import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { chatWithConversationalAgent, checkChatServerStatus } from "../chatbotAPICalls/conversationalCall";
import { useNavigate } from 'react-router-dom'



// SVG Icon Components
const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const SendIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
  </svg>
);

const PaperclipIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const ImageIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

const FileIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
);

const ChevronLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
  </svg>
);

const ChevronRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
  </svg>
);

const RobotIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z" />
  </svg>
);





// Message Component
const MessageBubble = ({ message: msg, isBot, onViewDetails }) => {
  return (
    <div className={`flex gap-3 mb-6 ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300 slide-in-from-bottom-2`}>
      {isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">AI</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={` max-w-[95%] px-4 py-3 ${isBot
          ? 'bg-gray-700 border border-gray-600 text-gray-200 rounded-tl-3xl rounded-br-3xl '
          : 'bg-gray-600 text-white ml-auto opacity-60 rounded-tr-3xl rounded-bl-3xl'
          } ${isBot ? '' : 'max-w-[80%]'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-x-auto">
            {msg.content}
          </p>

          {/* View Details Button for API responses with visualizations */}
          {/* {hasVisualization && (
            navigate(`/aiChat?t=${Date.now()}`),
            <button
              onClick={() => {
                onViewDetails(msg.apiResponse);
                // Add timestamp to force fresh data load
                //navigate(`/aiChat?t=${Date.now()}`);
              }}
              className="flex items-center gap-2 mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-500 
              text-white text-xs rounded-md transition-colors"
            >
              <ChartIcon size={14} />
              View Detailed Analysis
              <ArrowRightIcon size={14} />
            </button>
          )} */}
          {msg.timestamp && (
            <p className={`text-xs mt-1 ${isBot ? 'text-gray-400' : 'text-blue-100'}`}>
              {msg.timestamp}
            </p>
          )}
        </div>
      </div>
      {!isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">U</span>
        </div>
      )}
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-6 justify-start animate-in fade-in duration-300 slide-in-from-bottom-2">
      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
        <span className="text-white text-xs font-semibold">AI</span>
      </div>
      <div className="max-w-fit">
        <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-gray-300 text-xs">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

// Attachment Preview Component
const AttachmentPreview = ({ attachments, onRemove }) => {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-gray-600 text-gray-200 px-3 py-1 rounded-md text-xs"
        >
          <span className="truncate max-w-[120px]">{attachment.name}</span>
          <button
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full p-0.5"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Upload Menu Component
const UploadMenu = ({ isOpen, onClose, onFileSelect }) => {
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const handleOptionClick = (type) => {
    switch (type) {
      case 'image':
        imageInputRef.current?.click();
        break;
      case 'document':
        documentInputRef.current?.click();
        break;
    }
    onClose();
  };

  const handleFileChange = (event, type) => {
    const files = Array.from(event.target.files);
    onFileSelect(files);
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute bottom-full left-0 mb-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 min-w-[160px]"
      >
        <button
          onClick={() => handleOptionClick('image')}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
        >
          <ImageIcon className="text-green-400" size={16} />
          Upload Image
        </button>
        <button
          onClick={() => handleOptionClick('document')}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded-b-md transition-colors"
        >
          <FileIcon className="text-orange-400" size={16} />
          Upload Docs
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'document')}
      />
    </>
  );
};







const Chat = ({ currentColor }) => {
  const { setIsClicked } = useStateContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your AI assistant. I can analyze your data and create visualizations. What are you looking for? Just ask!",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'results'
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [chatHeight, setChatHeight] = useState(600);
  const [chatServerStatus, setChatServerStatus] = useState('');
  const [currentResults, setCurrentResults] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const getChatServerStatus = async () => {
    const chatServerStatus = await checkChatServerStatus();
    setChatServerStatus(chatServerStatus.status)
    console.log(chatServerStatus);
  }


  useEffect(() => {
    scrollToBottom();
    getChatServerStatus();
  }, [messages, isTyping]);

  // Auto-navigate to results page when a message with visualizations is added
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isBot && lastMessage.apiResponse?.reply?.visualizations?.length > 0) {
      // Automatically navigate to results page when visualization is available
      handleViewDetails(lastMessage.apiResponse);
      navigate(`/aiChat?t=${Date.now()}`);
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);


  const callAgentAPI = async (message) => {
    const response = await chatWithConversationalAgent(message);
    console.log(response);
    return response
  }


  const handleSendMessage = async () => {
    const text = inputValue.trim();
    //if (!text && attachments.length === 0) return;

    if (!text) return;

    const userMessage = {
      id: Date.now(),
      content: text,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsTyping(true);

    try {
      // Calling API for getting data from the agent
      const userMsgFormat = {
        message: text,
        sessionId: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      const apiResponse = await callAgentAPI(userMsgFormat);
      setTimeout(() => {
        let botMessage;

        if (apiResponse && apiResponse.reply) {
          // API returned structured data
          botMessage = {
            id: Date.now() + 1,
            content: apiResponse.reply.summary,
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            apiResponse: apiResponse // Storing the full API response
          };
        } else {
          // Regular chat response
          let botResponse = '';
          if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
            botResponse = "Hello! I'm here to help you analyze data and create visualizations. Ask me about downtime records, sensors, or any data analysis!";
          } else {
            botResponse = `I understand you're asking about: "${text}"\n\nTry asking about "sensor downtime records" to see a visualization example!`;
          }

          botMessage = {
            id: Date.now() + 1,
            content: botResponse,
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (files) => {
    const newAttachments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };


  // Move all hooks to the top, before any conditional returns
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const deltaX = resizeStartRef.current.x - e.clientX;
    const deltaY = e.clientY - resizeStartRef.current.y;

    const newWidth = Math.max(300, Math.min(800, resizeStartRef.current.width + deltaX));
    const newHeight = Math.max(400, Math.min(800, resizeStartRef.current.height + deltaY));

    setChatWidth(newWidth);
    setChatHeight(newHeight);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    const handleMouseMoveEvent = (e) => handleMouseMove(e);
    const handleMouseUpEvent = () => handleMouseUp();

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMoveEvent);
      document.addEventListener('mouseup', handleMouseUpEvent);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveEvent);
      document.removeEventListener('mouseup', handleMouseUpEvent);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleViewDetails = (apiResponse) => {
    setCurrentResults(apiResponse);
    setCurrentView('results');
    // Store the API response in localStorage for ChatResponse component
    localStorage.setItem('chatAnalysisResults', JSON.stringify(apiResponse));
    // Dispatch custom event to notify ChatResponse component
    window.dispatchEvent(new Event('chatResultsUpdated'));
  };



  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Resize handlers
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: chatWidth,
        height: chatHeight
      };
      e.preventDefault();
    }
  };



  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClose = () => {
    setIsClicked({ chat: false, notification: false, userProfile: false, enableEditing: false });
  };

  const isInputEmpty = !inputValue.trim() && attachments.length === 0;




  return (
    <>
      {/* Collapse Button - positioned on the left side when collapsed */}
      {isCollapsed && (
        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-[1001]">
          <button
            onClick={toggleCollapse}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-l-lg border border-r-0 border-gray-600 flex items-center justify-center transition-colors shadow-lg"
          >
            <ChevronLeftIcon size={20} className="text-gray-300" />
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div
        ref={chatRef}
        className={`fixed top-16 right-4 bg-gray-800 text-gray-200 rounded-xl shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? 'opacity-0 pointer-events-none translate-x-full' : 'opacity-100 pointer-events-auto translate-x-0'
          }`}
        style={{
          width: `${chatWidth}px`,
          height: `${chatHeight}px`,
          zIndex: 1000,
          minWidth: '300px',
          minHeight: '400px',
          maxWidth: '800px',
          maxHeight: '800px'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize handle */}
        <div className="resize-handle absolute -left-1 top-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-blue-500/20 transition-colors"></div>
        <div className="resize-handle absolute left-0 -top-1 w-full h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/20 transition-colors"></div>
        <div className="resize-handle absolute -left-1 -top-1 w-3 h-3 cursor-nw-resize bg-transparent hover:bg-blue-500/30 transition-colors"></div>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-3 bg-gray-900 border-b border-gray-600 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              <RobotIcon size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">SmartWeld Assistant</h1>
              {chatServerStatus === 'OK' ? (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </p>
              ) : (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Offline
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapse}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronRightIcon size={16} className="text-gray-400" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              <CloseIcon size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0"
          onClick={() => setUploadMenuOpen(false)}
        >
          <div className="max-w-none">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isBot={msg.isBot} onViewDetails={handleViewDetails} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Container */}
        <div className="flex-shrink-0 px-5 py-4 bg-gray-900 border-t border-gray-600 rounded-b-xl">
          <AttachmentPreview attachments={attachments} onRemove={removeAttachment} />

          <div className="flex items-end gap-2 bg-gray-800 border border-gray-600 rounded-lg p-2 focus-within:border-blue-500 transition-colors">
            {/* Upload Button */}
            <div className="relative justify-center">
              <button
                onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                type="button"
                style={{ color: currentColor }}
              >
                <PaperclipIcon size={16} />
              </button>
              <UploadMenu
                isOpen={uploadMenuOpen}
                onClose={() => setUploadMenuOpen(false)}
                onFileSelect={handleFileSelect}
              />
            </div>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm resize-none min-h-[20px] max-h-[120px] py-2 px-3"
              rows={1}
              onClick={() => setUploadMenuOpen(false)}
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={isInputEmpty}
              className={`p-2 rounded-md transition-colors ${isInputEmpty
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-purple-500'
                }`}
              type="button"
              style={{
                backgroundColor: !isInputEmpty ? currentColor : undefined,
                color: !isInputEmpty ? 'white' : undefined
              }}
            >
              <SendIcon size={16} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button
              className="text-xs px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              onClick={() => setInputValue("How can you help me?")}
            >
              Quick Help
            </button>
            <button
              className="text-xs px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              onClick={() => setInputValue("Show me the dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;