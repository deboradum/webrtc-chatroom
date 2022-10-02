import { useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import NotificationMessage from "./NotificationMessage"
import Typebox from "./Typebox";
import Topbar from "./Topbar";

export default function Client() {
    const [messages, addMessage] = useState([]);
    const [remoteConnection] = useState(new RTCPeerConnection());
    const [sendChan, updateSendChan] = useState(null);

    // Nog buttons disablen
    function createAnswer() {
        let offerInput = document.getElementById("offer-input");
        if (!offerInput.value) {
            offerInput.style.border="1px solid red";
        } else {
            let answerSDP = document.getElementById("answer-sdp");
            let messageDiv = document.getElementById("message-div");

            // Datachannel handler.
            remoteConnection.ondatachannel = (message) => {
                // Creates datachannel
                let channel = message.channel;
                // Onmessage handler.
                channel.onmessage = (m) => {
                    sendMessageReceived(JSON.parse(m.data));
                    messageDiv.scrollTop = messageDiv.scrollHeight;
                };
                // On channel open handler.
                channel.onopen = (m) => {
                    sendMessageNotification("connected! You can now chat.");
                    document.getElementById("disconnect-btn").classList.remove("hidden");
                    document.getElementById("download-btn").classList.remove("hidden");
                };
                // On channel close handler.
                channel.onclose = (m) => {
                    sendMessageNotification("Disconnected.");
                    document.getElementById("send-btn").disabled = true;
                };

                // Sets the channel state.
                updateSendChan(channel);
            };
            // Onicecandidate handler.
            remoteConnection.onicecandidate = (message) => {
                if (message.candidate) {
                    answerSDP.innerHTML = JSON.stringify(remoteConnection.localDescription);
                    navigator.clipboard.writeText(JSON.stringify(remoteConnection.localDescription));
                }
            };

            let offer;
            try {
                offer = new RTCSessionDescription(JSON.parse(offerInput.value));
                // Sets the offer the remote connection received from the local connection.
                remoteConnection.setRemoteDescription(offer);
                // Creates an answer to the offer it got from the local connection.
                remoteConnection.createAnswer().then((answer) => remoteConnection.setLocalDescription(answer));
            } catch {
                offerInput.style.border="1px solid red";
                offerInput.value = "";
                offerInput.placeholder = "Incorrect offer SDP";
            }
        }
    };

    // Sends a message through the channel.
    function sendMessage() {
        let sendMessageBox = document.getElementById("sendMessageBox");
        if(sendMessageBox.value) {
            sendChan.send(JSON.stringify(sendMessageBox.value));
            sendMessageSent(sendMessageBox.value);
            sendMessageBox.value= "";
        }
    };

    // Disconnects from the channel.
    function disconnect() {
        remoteConnection.close();
    }

    // Downloads all messages in a .txt file.
    function downloadLog() {
        let text = "";
        let messageLog = [...messages];
        messageLog.map(el => {
            text = text.concat("{Type: " + el.type);
            text = text.concat("; Time: " + el.time);
            text = text.concat("; Content: " + el.content + "}\n");
            return null;
        });

        const blob = new Blob([text], { type: 'text/plain' });
        let href = URL.createObjectURL(blob);

        const downloadLink = Object.assign(document.createElement("a"), {
            href,
            style:"display:none",
            download:"webRTC-ChatLog.txt"});
        document.body.appendChild(downloadLink);
        downloadLink.click();
        URL.revokeObjectURL(href);
        downloadLink.remove();
    };



    function sendMessageNotification(text) {
        let mess = {id: Math.random(),
            type: "notification",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function sendMessageSent(text) {
        let mess = {id: Math.random(),
            type: "sent",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function sendMessageReceived(text) {
        let mess = {id: Math.random(),
            type: "received",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    return (
        <>
            <div className="px-5 md:px-44 bg-gray-700 h-screen flex flex-col justify-between">
                <Topbar />
                <div id="connect-div" className="py-5 text-white text-center">
                    <p className="text-xl mb-2 text-center">To join a session, follow these two steps!</p>
                    <span>2: Paste offer SDP here.<button className="bg-slate-100 text-black rounded-xl p-1 ml-2 mb-2 text-sm" id="get-answer-btn" onClick={createAnswer}>Get answer</button></span>
                    <textarea id='offer-input' className="bg-slate-100 w-full h-10 mb-6 text-black p-2 resize-none"></textarea>

                    <span>3: Send the following answer SDP to your friend.</span>
                    <textarea disabled id="answer-sdp" className="w-full mt-3 mb-3 h-10 bg-slate-100 text-black p-2 resize-none"></textarea>
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
