import { useState, useRef, useEffect } from 'react'
import { Send, Users, User, Cloud, Trash2 } from 'lucide-react'
import './App.css'

const BOARD_MEMBERS = [
  { id: 'all', name: 'Entire Board', role: 'All Members', color: '#8b5cf6' },
  { id: 'chairman', name: 'The Chairman', role: 'Final Decisions', color: '#3b82f6' },
  { id: 'ceo', name: 'CEO', role: 'Strategy', color: '#10b981' },
  { id: 'cfo', name: 'CFO', role: 'Finance', color: '#f59e0b' },
  { id: 'cto', name: 'CTO', role: 'Technology', color: '#ef4444' },
  { id: 'cpo', name: 'CPO', role: 'Product', color: '#ec4899' },
  { id: 'cmo', name: 'CMO', role: 'Marketing', color: '#6366f1' },
]

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [selectedMember, setSelectedMember] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          targetMember: selectedMember
        })
      })

      if (!response.ok) throw new Error('API call failed')

      const data = await response.json()

      if (data.responses) {
        data.responses.forEach((resp, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + index,
              type: 'board',
              member: resp.member,
              content: resp.content,
              timestamp: new Date().toLocaleTimeString()
            }])
          }, index * 500)
        })
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'board',
          member: data.member || selectedMember,
          content: data.content,
          timestamp: new Date().toLocaleTimeString()
        }])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getMemberColor = (memberId) => {
    return BOARD_MEMBERS.find(m => m.id === memberId)?.color || '#6b7280'
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <Cloud size={32} color="#8b5cf6" />
            <div>
              <h1>Raincloud Board</h1>
              <p>AI Governance Platform</p>
            </div>
          </div>
          <button onClick={() => setMessages([])} className="icon-button">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <Users size={20} />
            <h2>Board Members</h2>
          </div>
          <div className="member-list">
            {BOARD_MEMBERS.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`member-button ${selectedMember === member.id ? 'active' : ''}`}
                style={{
                  borderLeftColor: member.color,
                  backgroundColor: selectedMember === member.id ? `${member.color}15` : 'transparent'
                }}
              >
                <User size={20} color={member.color} />
                <div className="member-info">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="chat-container">
          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <Cloud size={64} color="#8b5cf6" />
                <h3>Welcome to Raincloud</h3>
                <p>Select a board member and start chatting</p>
              </div>
            )}

            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'board' && (
                  <div
                    className="message-avatar"
                    style={{ backgroundColor: getMemberColor(message.member) }}
                  >
                    {message.member?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="message-content">
                  {message.type === 'board' && (
                    <div className="message-header">
                      <strong>{BOARD_MEMBERS.find(m => m.id === message.member)?.name}</strong>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="message-header">
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                  )}
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message board">
                <div className="message-avatar loading-avatar">
                  <div className="loading-spinner"></div>
                </div>
                <div className="message-content">
                  <div className="loading-text">Thinking...</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${selectedMember === 'all' ? 'the board' : BOARD_MEMBERS.find(m => m.id === selectedMember)?.name}...`}
                disabled={isLoading}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="input-hint">
              Enter to send • Shift+Enter for new line
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
