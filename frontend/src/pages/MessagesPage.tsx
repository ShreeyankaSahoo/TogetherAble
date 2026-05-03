import { useEffect, useState } from "react";

const MessagesPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const user1 = "user1"; // temporary
  const user2 = "user2";

  // FETCH MESSAGES
  const fetchMessages = async () => {
    const res = await fetch(
      `http://localhost:10000/messages/${user1}/${user2}`
    );
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // SEND MESSAGE
  const sendMessage = async () => {
    await fetch("http://localhost:10000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: user1,
        receiver: user2,
        text,
      }),
    });

    setText("");
    fetchMessages();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat</h2>

      <div style={{ border: "1px solid gray", height: "300px", overflowY: "scroll", padding: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default MessagesPage;