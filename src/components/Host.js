import { useEffect, useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import Typebox from "./Typebox";

export default function Host() {
    const [messages, addMessage] = useState([]);
    const [hostConnection, updateConnection] = useState(new RTCPeerConnection());
    const [sendChan, updateSendChan] = useState(hostConnection.createDataChannel("SendChannel"))

    // let hostConnection;
    // let sendChan;
    let answerInput;
    let offerSDP;
    let messageDiv;
    useEffect(() => {
        answerInput = document.getElementById("answer-input");
        offerSDP = document.getElementById("offer-sdp");
        messageDiv = document.getElementById("message-div");

        hostConnection.oniceconnectionstatechange = function (e) {
            var state = hostConnection.iceConnectionState
            console.log("Change: " + hostConnection.iceConnectionState)
        };

        hostConnection.onicecandidate = (message) => {
            if (message.candidate) {
                offerSDP.innerHTML = JSON.stringify(hostConnection.localDescription)
                navigator.clipboard.writeText(JSON.stringify(hostConnection.localDescription))
            }
        };
    })

    function connect() {
        if (answerInput.value) {
            let answer = new RTCSessionDescription(JSON.parse(answerInput.value));
            hostConnection.setRemoteDescription(answer)
        }
    };

    function createOffer() {
        // Sets up the client connection. This connection sends out the connection
        // request.
        // hostConnection = new RTCPeerConnection();


        // Creates a channel.
        // sendChan = hostConnection.createDataChannel("SendChannel");



        // Creates the offer.
        hostConnection.createOffer().then((offer) => hostConnection.setLocalDescription(offer))

        sendChan.onopen = (message) => {
            console.log("Connection opened from LC side.");
        }
        sendChan.onerror = (e) => {
            console.log(e)
        }
        sendChan.onmessage = (m) => {
            let mess = {id: Math.random(),
                    type: "text",
                    content: JSON.parse(m.data),
                    sOr: "received"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            messageDiv.scrollTop = messageDiv.scrollHeight;
        }
    };

    function add() {
        let sendMessageBox = document.getElementById("sendMessageBox");
        if (sendMessageBox.value) {
            let mess = {id: Math.random(),
                type: "text",
                content: sendMessageBox.value,
                sOr: "sent"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            messageDiv.scrollTop = messageDiv.scrollHeight;
        }
    }

    function sendMessage() {
        console.log(hostConnection)
        let sendMessageBox = document.getElementById("sendMessageBox");
        if (sendMessageBox.value) {
            sendChan.send(JSON.stringify(sendMessageBox.value));
            let mess = {id: Math.random(),
                type: "text",
                content: sendMessageBox.value,
                sOr: "sent"}
            addMessage((oldMessages) =>[...oldMessages, mess]);
            sendMessageBox.value = "";
        }
    };

    return (
        <>
            <div className="px-5 md:px-48 bg-gray-700 h-screen flex flex-col justify-between">
                <div id="connect-div" className="p-5 text-white">
                    <p className="text-xl mb-2 text-center">To host a session, follow these two steps!</p>
                    <p>1: Send the following offer to your friend<button className="bg-slate-100 text-black rounded p-1 ml-2" id="get-offer-btn" onClick={createOffer}>Get offer</button></p>

                    <br></br>
                    <textarea disabled id='offer-sdp' className="w-full mb-6 bg-slate-100 text-black p-2 resize-none"></textarea>
                    <p>3: Paste answer here<button className="bg-slate-100 text-black rounded p-1 ml-2" id="connect-btn" onClick={connect}>Connect</button></p>

                    <br></br>
                    <textarea id="answer-input" className="bg-slate-100 w-full mb-6 text-black p-2 resize-none"></textarea>
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