import { useEffect } from "react";

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
            <div id="connect-div" className="bg-gray-700 p-5 text-white">
                <p className="text-xl my-8">To join a session, follow these two steps!</p>
                <p>2: Paste offer here:</p>
                <button className="bg-white text-black rounded p-1 ml-5" id="get-answer-btn" onClick={createAnswer}>Get answer</button>
                <br></br>
                <textarea id='offer-input' className="w-4/5 my-6 text-black p-2"></textarea>
                <p>Send the following answer to your friend:</p>
                <textarea id="answer-sdp" className="w-4/5 my-6 text-black p-2"></textarea>
                <hr></hr>
            </div>
            <div id="message-div">

            </div>
        </>
    )
}