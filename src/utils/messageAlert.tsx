import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle, Info, XCircle } from 'lucide-react';
import './messageAlert.css';

type MessageType = 'success' | 'info' | 'error';

interface MessageAlertOptions {
  type?: MessageType;
  message: string;
  duration?: number;
}

interface MessageItem {
  id: number;
  type: MessageType;
  message: string;
}

let addMessage: any;

export function messageAlert({ type = 'info', message = '', duration = 3000 }: MessageAlertOptions) {
  if (addMessage) {
    addMessage({ type, message, duration });
  }
}

function MessageContainer() {
  const [messages, setMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    addMessage = ({ type = 'info', message, duration = 3000 }: MessageAlertOptions) => {
      const id = Date.now();
      setMessages((prev) => [
        ...prev,
        { id, type, message },
      ]);
  
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, duration);
    };
  }, []);

  const icons = {
    success: <CheckCircle className="msg-icon success" size={18} />,
    info: <Info className="msg-icon info" size={18} />,
    error: <XCircle className="msg-icon error" size={18} />,
  };

  return (
    <div className="msg-container">
      {messages.map(({ id, type, message }) => (
        <div key={id} className={`msg-box ${type}`}>
          {icons[type]}
          <span className="msg-text">{message}</span>
        </div>
      ))}
    </div>
  );
}

const div = document.createElement('div');
document.body.appendChild(div);
const root = createRoot(div);
root.render(<MessageContainer />);
