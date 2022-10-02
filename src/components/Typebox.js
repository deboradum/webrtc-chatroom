function Typebox({ sendMessage, sendFile }) {
    return (
        <div id="typebox" className="place-self-center">
            <input id="sendMessageBox" className="md:w-80 w-56 h-10 p-4 rounded-xl bg-slate-100 my-5 text-black"></input>
            <button id="send-btn" className="ml-2 px-5 h-10 rounded-full bg-slate-100 text-black" onClick={sendFile}>File</button>
            <button id="send-btn" className="ml-2 px-5 h-10 rounded-full bg-slate-100 text-black" onClick={sendMessage}>Send</button>

        </div>
    )
};

export default Typebox;
