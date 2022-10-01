function ReceivedMessage({ text, time }) {
    return (
        <div className="p-2 my-2 ml-9 max-w-lg w-fit break-words rounded-lg bg-yellow-100 text-base">{text}<div className="text-xs text-left italic">{time}</div></div>
    )
};

export default ReceivedMessage;