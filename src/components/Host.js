import { useEffect, useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import Typebox from "./Typebox";

export default function Host() {
    const [messages, addMessage] = useState([])

    let hostConnection
    let sendChan
    let answerInput
    let offerSDP
    useEffect(() => {
        // Sets up the client connection. This connection sends out the connection
        // request.
        hostConnection = new RTCPeerConnection();
        answerInput = document.getElementById("answer-input");
        offerSDP = document.getElementById("offer-sdp");

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
        // Creates a channel.
        sendChan = hostConnection.createDataChannel("SendChannel");
        // Creates the offer.
        hostConnection.createOffer().then((offer) => hostConnection.setLocalDescription(offer))

        sendChan.onopen = (message) => {
            console.log("Connection opened from LC side.");
        }
        sendChan.onmessage = (m) => {
            addMessage(messages.concat(<SentMessage />))
        }
    };

    return (
        <>
            <div className="px-5 md:px-48 bg-gray-700 h-screen flex flex-col justify-between">
                <div id="connect-div" className="p-5 text-white">
                    <p className="text-xl mb-2 text-center">To host a session, follow these two steps!</p>
                    <p>1: Send the following offer to your friend<button className="bg-white text-black rounded p-1 ml-2" id="get-offer-btn" onClick={createOffer}>Get offer</button></p>

                    <br></br>
                    <textarea disabled id='offer-sdp' className="w-full mb-6 bg-white text-black p-2 resize-none"></textarea>
                    <p>3: Paste answer here<button className="bg-white text-black rounded p-1 ml-2" id="connect-btn" onClick={connect}>Connect</button></p>

                    <br></br>
                    <textarea id="answer-input" className="w-full mb-6 text-black p-2 resize-none"></textarea>
                    <hr></hr>
                </div>
                <div id="message-div" className="overscroll-contain h-80 grow overflow-y-auto flex flex-col">
                    <SentMessage />
                    <ReceivedMessage />
                    {messages}

                </div>
                <Typebox />
            </div>
        </>
    )
}