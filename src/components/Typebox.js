function Typebox({ sendMessage }) {
    return (
        <div className="place-self-center">
            <input id="sendMessageBox" className="w-96 h-10 p-4 rounded-xl bg-slate-100 my-5 text-black"></input>
            <button className="ml-5 px-5 h-10 rounded-full bg-slate-100 text-black" onClick={sendMessage}>send</button>
        </div>
    )
};

export default Typebox;