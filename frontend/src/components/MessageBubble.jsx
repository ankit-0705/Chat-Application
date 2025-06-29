import React from 'react';

function MessageBubble({ message, isOwnMessage }) {
  const content = message?.content || '[No content]';

  const bubbleStyle = isOwnMessage
    ? { background: 'linear-gradient(135deg, #FF7043, #F06292)' }
    : { background: 'linear-gradient(135deg, #7F2DBD, #F06292)' };

  const time = (() => {
    if (!message?.createdAt) return 'Unknown time';
    const date = new Date(message.createdAt);
    if (isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  })();

  return (
    <div className={`chat ${isOwnMessage ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-header text-white gap-2 flex items-center">
        {!isOwnMessage && <span>{message.sender?.name || 'Unknown'}</span>}
        <time className="text-xs opacity-50">{time}</time>
      </div>

      <div className="chat-bubble text-white" style={bubbleStyle}>
        {content}
      </div>
    </div>
  );
}

export default MessageBubble;
