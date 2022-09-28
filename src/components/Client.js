import { useEffect, useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import Typebox from "./Typebox";

export default function Client() {
    let remoteConnection;
    let channel;
    let answerSDP;
    let offerInput;

    useEffect(() => {
        remoteConnection = new RTCPeerConnection();
        answerSDP = document.getElementById("answer-sdp");
        offerInput = document.getElementById("offer-input");

        remoteConnection.oniceconnectionstatechange = function (e) {
            var state = remoteConnection.iceConnectionState
            console.log("Change: " + remoteConnection.iceConnectionState)
        };

        remoteConnection.ondatachannel = (message) => {
            channel = message.channel;
            channel.onmessage = (m) => {
                // messagesBox.innerHTML += "local: " + m.data
            }
            channel.onopen = (m) => {
                console.log("connection opened from RC side.")
            }
        }

        remoteConnection.onicecandidate = (message) => {
            if (message.candidate) {
                answerSDP.innerHTML = JSON.stringify(remoteConnection.localDescription)
                navigator.clipboard.writeText(JSON.stringify(remoteConnection.localDescription))
            }
        }
    })

    function createAnswer() {
        const offer = new RTCSessionDescription(JSON.parse(offerInput.value));
        // Sets the offer the remote connection received from the local connection.
        remoteConnection.setRemoteDescription(offer)
        // Creates an answer to the offer it got from the local connection.
        remoteConnection.createAnswer().then((answer) => remoteConnection.setLocalDescription(answer))
    }

    return (
        <>
            <div className="px-5 md:px-48 bg-gray-700 h-screen flex flex-col justify-between">
                <div id="connect-div" className="p-5 text-white">
                    <p className="text-xl mb-2 text-center">To join a session, follow these two steps!</p>
                    <p>2: Paste offer here<button className="bg-white text-black rounded p-1 ml-2" id="get-answer-btn" onClick={createAnswer}>Get answer</button></p>

                    <br></br>
                    <textarea id='offer-input' className="w-full mb-6 text-black p-2 resize-none"></textarea>
                    <p>Send the following answer to your friend:</p>
                    <textarea disabled id="answer-sdp" className="w-full my-6 bg-white text-black p-2 resize-none"></textarea>
                    <hr></hr>
                </div>
                <div id="message-div" className="overscroll-contain h-80 grow overflow-y-auto flex flex-col">
                    <SentMessage />
                    <ReceivedMessage />
                </div>
                <Typebox />
            </div>


        </>
    )
}