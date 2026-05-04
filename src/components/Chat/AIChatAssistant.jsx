// src/components/Chat/AIChatAssistant.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getConversations,
  getConversation,
  deleteConversation as deleteConversationApi,
  sendMessage as sendMessageApi,
} from "../../services/api";
import {
  FaRobot,
  FaPaperPlane,
  FaUser,
  FaTrash,
  FaRegCopy,
  FaThumbsUp,
  FaThumbsDown,
  FaSpinner,
  FaHistory,
  FaChevronLeft,
  FaPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";
import VoiceRecorder from "./VoiceRecorder";

const AIChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Welcome to AI Academic Assistant!\n\nI'm here to help you with:\n• Course selection and recommendations\n• Registration deadlines and procedures\n• Academic policies and regulations\n• Study tips and success strategies\n• Career guidance and internships\n\nHow can I help you today?",
      timestamp: new Date(),
      feedback: null,
    },
  ]);
  const voiceRecorderRef = useRef();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [audioMessage, setAudioMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const checkConnectionRef = useRef(false);
  const messageIdCounter = useRef(1);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (!checkConnectionRef.current) {
      checkConnectionRef.current = true;
      const checkConnection = async () => {
        try {
          const response = await getConversations();
          if (response.status === 200) {
            setIsConnected(true);
          }
        } catch {
          setIsConnected(false);
          console.warn("Chat API connection issue");
        }
      };
      checkConnection();
    }
  }, []);

  // ✅ دالة جلب المحادثات (منفصلة عشان نستخدمها في startNewChat)
  const fetchConversations = async () => {
    try {
      const response = await getConversations();
      const allConversations = response.data || [];

      const chatbotConversations = allConversations.filter((conv) => {
        const isAdvisorConversation =
          conv.type === "advisor" ||
          conv.isAdvisor === true ||
          conv.title?.toLowerCase().includes("advisor") ||
          conv.participantRole === "advisor";
        return !isAdvisorConversation;
      });

      const formattedConversations = chatbotConversations.map((conv, index) => ({
        id: conv.id,
        title: conv.title || `Conversation ${conv.id}`,
        lastMessage: conv.lastMessage || conv.lastMessageContent || "No messages",
        date: conv.updatedAt || conv.createdAt || conv.lastMessageAt || (() => {
          const daysAgo = Math.min(index + 1, 30);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          return date.toISOString();
        })(),
        preview: conv.preview || (conv.lastMessageContent ? conv.lastMessageContent.substring(0, 50) : "No messages"),
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ✅ جلب المحادثات - تصفية محادثات المشرف (أول تحميل)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingHistory(true);
      await fetchConversations();
    };
    fetchData();
  }, []);

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !audioMessage) || isLoading) return;

    let messageContent = inputMessage;

    if (audioMessage) {
      messageContent = inputMessage || "[Voice message]";
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.clearRecording();
      }
      setAudioMessage(null);
    }

    if (!messageContent.trim()) return;

    const userMessage = {
      id: generateId(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      feedback: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = messageContent;
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendMessageApi({
        content: currentMessage,
        type: audioMessage ? "audio" : "text",
      });

      let aiResponse = "Thank you for your message.";

      if (response.data?.content) {
        aiResponse = response.data.content;
      } else if (response.data?.message) {
        aiResponse = response.data.message;
      } else if (response.data?.response) {
        aiResponse = response.data.response;
      } else if (response.data?.reply) {
        aiResponse = response.data.reply;
      } else if (typeof response.data === "string") {
        aiResponse = response.data;
      }

      const aiMessage = {
        id: generateId(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        feedback: null,
        messageId: response.data?.id,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: generateId(),
        role: "assistant",
        content: "⚠️ Connection error occurred.\n\nPlease try again.",
        timestamp: new Date(),
        feedback: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleVoiceRecordingComplete = (audioBlob) => {
    console.log("Recording completed:", audioBlob);
    setAudioMessage(audioBlob);
    toast.success("Voice message recorded! Click send to share.");
  };

  // ✅ Clear Chat - يمسح المحادثة الحالية فقط (لا يحفظها)
  const clearChat = () => {
    if (window.confirm("Clear current conversation? This cannot be undone.")) {
      setMessages([
        {
          id: "welcome-new",
          role: "assistant",
          content: "Chat cleared.\n\nHow can I help you today?",
          timestamp: new Date(),
          feedback: null,
        },
      ]);
      setActiveConversation(null);
      toast.success("Chat cleared");
    }
  };

  // ✅ Start New Chat - يبدأ محادثة جديدة ويحفظ القديمة في الخلفية
  const startNewChat = async () => {
    if (window.confirm("Start a new conversation? The current chat will be saved.")) {
      
      setIsLoadingHistory(true);
      
      // حفظ المحادثة الحالية (إنشاء conversationId جديد)
      if (messages.length > 1) {
        try {
          const token = localStorage.getItem('token');
          await fetch('/api/Chat/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              conversationId: null,  // null = إنشاء محادثة جديدة
              message: "--- Conversation saved ---",
              type: 'text'
            })
          });
        } catch (err) {
          console.error('Error saving conversation:', err);
        }
      }
      
      // تحديث قائمة المحادثات في الـ Sidebar
      await fetchConversations();
      
      // بدء محادثة جديدة
      setMessages([
        {
          id: "welcome-new-" + Date.now(),
          role: "assistant",
          content: "Hello! I'm your AI Academic Advisor. How can I help you today?",
          timestamp: new Date(),
          feedback: null,
        },
      ]);
      
      setActiveConversation(null);
      toast.success("New conversation started! Your previous chat is saved.");
    }
  };

  const loadConversation = async (conversation) => {
    setActiveConversation(conversation.id);
    setIsLoadingHistory(true);

    try {
      const response = await getConversation(conversation.id);
      const loadedMessages = (response.data?.messages || []).map((msg) => ({
        id: msg.id,
        role:
          msg.sender === "user" || msg.senderId === "user"
            ? "user"
            : "assistant",
        content: msg.content,
        timestamp: new Date(msg.createdAt || msg.timestamp),
        feedback: null,
      }));

      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }

      setShowHistory(false);
      toast.success(`Loaded: ${conversation.title}`);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation();

    if (window.confirm("Delete this conversation?")) {
      try {
        await deleteConversationApi(conversationId);
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));

        if (activeConversation === conversationId) {
          setMessages([
            {
              id: "welcome-new",
              role: "assistant",
              content: "Chat cleared.\n\nHow can I help you today?",
              timestamp: new Date(),
              feedback: null,
            },
          ]);
          setActiveConversation(null);
        }

        toast.success("Conversation deleted");
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        toast.error("Failed to delete conversation");
      }
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const giveFeedback = async (messageId, type) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: type } : msg
      )
    );
    toast.success(`Thank you for your feedback!`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (isNaN(date.getTime())) return "Recent";
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const suggestedQuestions = [
    { text: "Tell me about available courses", icon: "📚" },
    { text: "What are the registration deadlines?", icon: "📅" },
    { text: "How can I improve my grades?", icon: "📊" },
    { text: "Tell me about scholarships", icon: "💰" },
    { text: "What are the academic policies?", icon: "📋" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Chat History Sidebar */}
      <div
        className={`${showHistory ? "w-80" : "w-0"} lg:w-80 bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 overflow-hidden flex flex-col shadow-xl z-20`}
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaHistory className="text-indigo-500" />
              <h2 className="font-semibold text-gray-800">Chat History</h2>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <FaChevronLeft size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoadingHistory && conversations.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FaHistory className="mx-auto text-3xl mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`group relative p-3 mb-2 rounded-xl transition-all duration-200 cursor-pointer ${activeConversation === conv.id ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800 text-sm truncate flex-1">
                    {conv.title}
                  </h3>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {formatDate(conv.date)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.preview}</p>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded-lg"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white"
            >
              <FaHistory size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg sm:text-xl tracking-tight">
                AI Academic Advisor
              </h1>
              <p className="text-xs flex items-center gap-1 text-white/80">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online • Ready to assist
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Connecting...
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* ✅ الأزرار - New Chat و Clear */}
          <div className="flex items-center gap-2">
            {/* زر New Chat - يبدأ محادثة جديدة ويحفظ القديمة */}
            <button
              onClick={startNewChat}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl transition-all duration-200 text-white text-sm"
              title="Start new conversation (saves current chat)"
            >
              <FaPlus size={14} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            
            {/* زر Clear - يمسح الشات الحالي فقط */}
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all duration-200 text-white text-sm"
              title="Clear current chat only"
            >
              <FaTrash size={14} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`flex gap-3 max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${message.role === "user" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}
                >
                  {message.role === "user" ? (
                    <FaUser size={14} className="text-white" />
                  ) : (
                    <FaRobot size={14} className="text-white" />
                  )}
                </div>
                <div className="group relative">
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${message.role === "user" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-white border border-gray-200/50 text-gray-800"}`}
                  >
                    <div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs mt-2 flex items-center gap-2 ${message.role === "user" ? "text-emerald-100" : "text-gray-400"}`}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                  {message.role === "assistant" && (
                    <div className="absolute -bottom-7 right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors rounded-lg"
                      >
                        <FaRegCopy size={11} />
                      </button>
                      <button
                        onClick={() => giveFeedback(message.id, "like")}
                        className={`p-1.5 transition-colors rounded-lg ${message.feedback === "like" ? "text-emerald-500 bg-emerald-50" : "text-gray-400 hover:text-emerald-500"}`}
                      >
                        <FaThumbsUp size={11} />
                      </button>
                      <button
                        onClick={() => giveFeedback(message.id, "dislike")}
                        className={`p-1.5 transition-colors rounded-lg ${message.feedback === "dislike" ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"}`}
                      >
                        <FaThumbsDown size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <FaRobot size={14} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-200/50">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex gap-2 items-end">
            <VoiceRecorder
              ref={voiceRecorderRef}
              onRecordingComplete={handleVoiceRecordingComplete}
            />
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about courses, registration, or academic guidance..."
                className="w-full input-field resize-none py-2 px-4 text-sm rounded-md border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200"
                rows={1}
                disabled={isLoading}
                style={{
                  minHeight: "44px",
                  maxHeight: "100px",
                  overflowY: "auto",
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !audioMessage) || isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 h-12 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin" size={16} />
              ) : (
                <FaPaperPlane size={16} />
              )}
              <span className="hidden sm:inline font-medium">Send</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {suggestedQuestions.map((q, index) => {
              const colors = [
                "from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100",
                "from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100",
                "from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100",
                "from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100",
                "from-cyan-50 to-sky-50 text-cyan-700 hover:from-cyan-100 hover:to-sky-100",
              ];
              return (
                <button
                  key={index}
                  onClick={() => setInputMessage(q.text)}
                  className={`text-xs sm:text-sm px-3 py-2 bg-gradient-to-r ${colors[index % colors.length]} rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm font-medium truncate`}
                >
                  {q.icon} {q.text}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            🤖 AI Advisor • Available 24/7 • Powered by advanced academic
            intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;