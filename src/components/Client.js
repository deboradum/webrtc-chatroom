import { useEffect, useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import Typebox from "./Typebox";

export default function Client() {
    const [messages, addMessage] = useState([]);
    const [remoteConnection, updateConnection] = useState(new RTCPeerConnection());
    const [sendChan, updateSendChan] = useState(null)

    // let remoteConnection;
    let answerSDP;
    let offerInput;
    let messageDiv;

    useEffect(() => {
        answerSDP = document.getElementById("answer-sdp");
        offerInput = document.getElementById("offer-input");
        messageDiv = document.getElementById("message-div");
    })

    // Nog buttons disablen
    function createAnswer() {
        // remoteConnection = new RTCPeerConnection();
        remoteConnection.oniceconnectionstatechange = function (e) {
            console.log("Change: " + remoteConnection.iceConnectionState)
        };
        remoteConnection.ondatachannel = (message) => {
            console.log(".ondatachannel called")



            let channel = message.channel;
            channel.onmessage = (m) => {
                let mess = {id: Math.random(),
                        type: "text",
                        content: JSON.parse(m.data),
                        sOr: "received"}
                addMessage((oldMessages) =>[...oldMessages, mess]);
                messageDiv.scrollTop = messageDiv.scrollHeight;
            }
            channel.onopen = (m) => {
                console.log("connection opened from RC side.")
            }

            updateSendChan(channel)
        }
        remoteConnection.onicecandidate = (message) => {
            if (message.candidate) {
                answerSDP.innerHTML = JSON.stringify(remoteConnection.localDescription)
                navigator.clipboard.writeText(JSON.stringify(remoteConnection.localDescription))
            }
        }

        const offer = new RTCSessionDescription(JSON.parse(offerInput.value));
        // Sets the offer the remote connection received from the local connection.
        remoteConnection.setRemoteDescription(offer)
        // Creates an answer to the offer it got from the local connection.
        remoteConnection.createAnswer().then((answer) => remoteConnection.setLocalDescription(answer))
    };

    function sendMessage() {
        console.log(remoteConnection)
        let sendMessageBox = document.getElementById("sendMessageBox");
        if(sendMessageBox.value) {
            sendChan.send(JSON.stringify(sendMessageBox.value));
            let mess = {id: Math.random(),
                type: "text",
                content: sendMessageBox.value,
                sOr: "sent"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            sendMessageBox.value= "";
        }
    };

    return (
        <>
            <div className="px-5 md:px-44 bg-gray-700 h-screen flex flex-col justify-between">
                <div id="connect-div" className="p-5 text-white">
                    <p className="text-xl mb-2 text-center">To join a session, follow these two steps!</p>
                    <p>2: Paste offer here<button className="bg-slate-100 text-black rounded p-1 ml-2" id="get-answer-btn" onClick={createAnswer}>Get answer</button></p>

                    <br></br>
                    <textarea id='offer-input' className="bg-slate-100 w-full h-10 mb-6 text-black p-2 resize-none"></textarea>
                    <p>Send the following answer to your friend:</p>
                    <textarea disabled id="answer-sdp" className="w-full my-6 h-10 bg-slate-100 text-black p-2 resize-none"></textarea>
                    <hr></hr>
                </div>
                <div id="message-div" className="overscroll-contain h-80 grow overflow-y-auto flex flex-col">
                    {messages.map((el) => {
                        if (el.sOr === "sent") {
                            return <SentMessage text={el.content} key={el.id} />
                        } else {
                            return <ReceivedMessage text={el.content} key={el.id} />
                        }
                    })}
                </div>
                <Typebox sendMessage={sendMessage} />
            </div>


        </>
    )
}