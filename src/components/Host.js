import { useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import NotificationMessage from "./NotificationMessage"
import Typebox from "./Typebox";
import Topbar from "./Topbar"

export default function Host() {
    const [messages, addMessage] = useState([]);
    const [hostConnection] = useState(new RTCPeerConnection());
    const [sendChan, updateSendChan] = useState(null)

    // Connects peers with the answer.
    function connect() {
        let answerInput = document.getElementById("answer-input");
        if (answerInput.value) {
            try {
                let answer = new RTCSessionDescription(JSON.parse(answerInput.value));
                hostConnection.setRemoteDescription(answer)
            } catch {
                answerInput.style.border="1px solid red";
                answerInput.value = "";
                answerInput.placeholder = "Incorrect answer SDP";
            }
        } else {
            answerInput.style.border="1px solid red";
        }
    };

    function createOffer() {
        let offerSDP = document.getElementById("offer-sdp");
        let messageDiv = document.getElementById("message-div");

        // Creates the offer.
        hostConnection.createOffer().then((offer) => hostConnection.setLocalDescription(offer))
        hostConnection.onicecandidate = (message) => {
            if (message.candidate) {
                offerSDP.innerHTML = JSON.stringify(hostConnection.localDescription)
                navigator.clipboard.writeText(JSON.stringify(hostConnection.localDescription))
            }
        };
        let channel = hostConnection.createDataChannel("SendChannel")

        // On channel open handler.
        channel.onopen = (m) => {
            let mess = {id: Math.random(),
                content: "connected! You can now chat.",
                time: new Date().toLocaleTimeString(),
                type: "notification"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            document.getElementById("disconnect-btn").classList.remove("hidden");
            document.getElementById("download-btn").classList.remove("hidden");
        }
        // On channel close handler.
        channel.onclose = (m) => {
            let mess = {id: Math.random(),
                content: "Connection disrupted.",
                type: "notification"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            document.getElementById("send-btn").disabled = true;
        }
        // Onmessage handler.
        channel.onmessage = (m) => {
            let mess = {id: Math.random(),
                    content: JSON.parse(m.data),
                    time: new Date().toLocaleTimeString(),
                    type: "received"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            messageDiv.scrollTop = messageDiv.scrollHeight;
        }

        updateSendChan(channel)
    };

    // Sends a message through the channel.
    function sendMessage() {
        let sendMessageBox = document.getElementById("sendMessageBox");
        if (sendMessageBox.value) {
            sendChan.send(JSON.stringify(sendMessageBox.value));
            let mess = {id: Math.random(),
                content: sendMessageBox.value,
                time: new Date().toLocaleTimeString(),
                type: "sent"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            sendMessageBox.value = "";
        }
    };

    function disconnect() {
        hostConnection.close();
    }

    function downloadLog() {

    }

    return (
        <>
            <div className="px-5 md:px-44 bg-gray-700 h-screen flex flex-col justify-between">
                <Topbar />
                <div id="connect-div" className="p-5 text-white text-center">
                    <p className="text-xl mb-2 text-center">To host a session, follow these two steps!</p>
                    <span>1: Send the following offer SDP to your friend.<button className="bg-slate-100 text-black rounded-xl text-sm p-1 ml-2 mb-2" id="get-offer-btn" onClick={createOffer}>Get offer</button></span>

                    <textarea disabled id='offer-sdp' className="w-full mb-6 h-10 bg-slate-100 text-black p-2 resize-none"></textarea>
                    <p>4: Paste answer SDP here.<button className="bg-slate-100 text-black rounded-xl p-1 text-sm ml-2 mb-2" id="connect-btn" onClick={connect}>Connect</button></p>

                    <textarea id="answer-input" className="bg-slate-100 h-10 w-full mb-3 text-black p-2 resize-none"></textarea>
                    <button className="bg-slate-100 text-black rounded-xl p-1 text-sm mb-2 mr-1 hidden" id="disconnect-btn" onClick={disconnect}>Disconnect</button>
                    <button className="bg-slate-100 text-black rounded-xl p-1 text-sm mb-2 ml-1 hidden" id="download-btn" onClick={downloadLog}>Download log</button>
                    <hr></hr>
                </div>
                <div id="message-div" className="overscroll-contain h-80 grow overflow-y-auto flex flex-col">
                    {messages.map((el) => {
                        if (el.type === "sent") {
                            return <SentMessage text={el.content} time={el.time} key={el.id} />
                        } else if (el.type === "received") {
                            return <ReceivedMessage text={el.content} time={el.time} key={el.id} />
                        } else {
                            return <NotificationMessage text={el.content} key={el.id} />
                        }
                    })}
                </div>
                <Typebox sendMessage={sendMessage} />
            </div>
        </>
    )
}