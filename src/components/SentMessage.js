function SentMessage({ text, time }) {
    return (
        <>
            <div className="p-2 my-2 mr-9 max-w-lg w-fit break-words rounded-lg bg-emerald-500 place-self-end text-base">{text}<div className="text-xs text-right italic">{time}</div></div>

        </>

    )
};

export default SentMessage;