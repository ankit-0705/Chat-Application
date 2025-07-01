import React from "react";

function MessageInput({ newMessage, setNewMessage, handleKeyDown, sendMessage, handleTyping }) {
  return (
    <div className="p-4 border-t border-gray-700 flex items-center space-x-2">
      <input
        value={newMessage}
        autoComplete="off"
        onChange={(e) => {
          setNewMessage(e.target.value);
          handleTyping(); // 👈 Call typing here
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-grow bg-[#1E1E2F] border border-[#7F2DBD] text-white placeholder-[#B0B0B0] focus:border-[#F06292] focus:ring-[#F06292] rounded px-3 py-2"
        rows={2}
      />
      <button
        onClick={sendMessage}
        className="btn bg-[#F06292] border-none text-white hover:bg-[#FF7043] px-6 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
