// src/components/Advisor/StudentChatView.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserGraduate, FaPaperPlane, FaSpinner, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentChatView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [ setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const isMounted = useRef(true);
  const intervalRef = useRef(null);
  const isFetching = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // دالة جلب المحادثة
  const fetchConversation = async () => {
    if (!studentId || !isMounted.current || isFetching.current) return;
    
    isFetching.current = true;
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. جلب معلومات الطالب
      const studentRes = await fetch(`/api/Advisor/students/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        if (isMounted.current) setStudent(studentData);
      }
      
      // 2. جلب المحادثة
      const convRes = await fetch(`/api/Advisor/students/${studentId}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (convRes.ok && isMounted.current) {
        const conversations = await convRes.json();
        let allMessages = [];
        
        for (const conv of conversations) {
          const convDetailRes = await fetch(`/api/Advisor/conversations/${conv.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (convDetailRes.ok) {
            const convDetail = await convDetailRes.json();
            if (convDetail.messages && convDetail.messages.length > 0) {
              const formattedMessages = convDetail.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender === 'Advisor' ? 'Advisor' : 'Student',
                senderId: msg.sender === 'Advisor' ? 'advisor' : 'student',
                timestamp: msg.timestamp,
                isRead: msg.isRead || false
              }));
              allMessages = [...allMessages, ...formattedMessages];
              if (conv.id) setConversationId(conv.id);
            }
          }
        }
        
        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(allMessages);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isFetching.current = false;
      }
    }
  };

  // تحديث الرسائل دورياً
  const updateMessages = async () => {
    if (!isMounted.current || !studentId) return;
    const token = localStorage.getItem('token');
    
    try {
      const convRes = await fetch(`/api/Advisor/students/${studentId}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (convRes.ok && isMounted.current) {
        const conversations = await convRes.json();
        let allMessages = [];
        
        for (const conv of conversations) {
          const convDetailRes = await fetch(`/api/Advisor/conversations/${conv.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (convDetailRes.ok) {
            const convDetail = await convDetailRes.json();
            if (convDetail.messages && convDetail.messages.length > 0) {
              const formattedMessages = convDetail.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender === 'Advisor' ? 'Advisor' : 'Student',
                senderId: msg.sender === 'Advisor' ? 'advisor' : 'student',
                timestamp: msg.timestamp,
                isRead: msg.isRead || false
              }));
              allMessages = [...allMessages, ...formattedMessages];
            }
          }
        }
        
        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(allMessages);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // ✅ useEffect الآمن
  useEffect(() => {
    let isActive = true;
    
    const initialize = async () => {
      if (!isActive) return;
      await fetchConversation();
    };
    
    initialize();
    
    intervalRef.current = setInterval(() => {
      if (isActive) {
        updateMessages();
      }
    }, 5000);
    
    return () => {
      isActive = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [studentId]);

  // إرسال رسالة للطالب
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;
    
    setSending(true);
    const messageText = inputMessage;
    setInputMessage('');
    
    const tempMsg = {
      id: Date.now(),
      content: messageText,
      senderId: 'advisor',
      sender: 'Advisor',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/Advisor/students/${studentId}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageText)
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMsg.id ? { ...msg, status: 'sent' } : msg
        ));
        toast.success('Message sent to student');
        setTimeout(() => updateMessages(), 500);
      } else {
        throw new Error('Send failed');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to send');
      setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
      setInputMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          onClick={() => navigate('/advisor')}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
        >
          <FaArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <FaUserGraduate className="text-white text-lg" />
        </div>
        <div>
          <h2 className="font-semibold text-white">
            {student?.fullName || student?.name || `Student ${studentId}`}
          </h2>
          {student && (
            <p className="text-white/70 text-xs">{student.email}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#efeae2]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FaUserGraduate className="text-5xl mb-3 opacity-40" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAdvisor = msg.senderId === 'advisor' || msg.sender === 'Advisor';
            return (
              <div key={msg.id || idx} className={`flex mb-3 ${isAdvisor ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isAdvisor ? 'mr-2' : 'ml-2'}`}>
                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                    isAdvisor 
                      ? 'bg-[#dcf8c5] text-gray-800 rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm break-words">{msg.content}</p>
                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                      {formatTime(msg.timestamp)}
                      {msg.status === 'sending' && <span className="ml-2 text-yellow-500">● Sending</span>}
                      {msg.status === 'sent' && <FaCheck className="ml-2 text-green-500 inline" size={10} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t">
        <div className="flex gap-2 items-end">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none p-3 text-sm border-0 rounded-2xl bg-gray-100 focus:bg-white focus:ring-1 focus:ring-green-500 focus:outline-none transition-all"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '100px' }}
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-green-700 transition-all shadow-md"
          >
            {sending ? <FaSpinner className="animate-spin" size={18} /> : <FaPaperPlane size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentChatView;