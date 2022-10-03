import { useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import NotificationMessage from "./NotificationMessage";
import FileMessage from "./FileMessage";
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
                    if (m.data instanceof Blob) {
                        let mess = {id: Math.random(),
                            type: "file",
                            time: new Date().toLocaleTimeString(),
                            file: m.data};
                        addMessage((oldMessages) =>[...oldMessages, mess]);
                    } else {
                        addMessageReceived(m.data);
                        messageDiv.scrollTop = messageDiv.scrollHeight;
                    }
                };
                // On channel open handler.
                channel.onopen = (m) => {
                    addMessageNotification("connected! You can now chat.");
                    document.getElementById("disconnect-btn").classList.remove("hidden");
                    document.getElementById("download-btn").classList.remove("hidden");
                };
                // On channel close handler.
                channel.onclose = (m) => {
                    addMessageNotification("Disconnected.");
                    document.getElementById("send-btn").disabled = true;
                };

                // Sets the channel state.
                updateSendChan(channel);
            };
            // Onicecandidate handler.
            remoteConnection.onicecandidate = (message) => {
                if (message.candidate) {
                    answerSDP.innerHTML = JSON.stringify(remoteConnection.localDescription);
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
            sendChan.send(sendMessageBox.value);
            addMessageSent(sendMessageBox.value);
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

    // function blurScreen() {
    //     document.getElementById("video-call-div").classList.remove("hidden");
    //     document.getElementById("connect-div").classList.add("pointer-events-none");
    //     document.getElementById("connect-div").classList.add("blur-sm");
    //     document.getElementById("message-div").classList.add("pointer-events-none");
    //     document.getElementById("message-div").classList.add("blur-sm");
    //     document.getElementById("typebox").classList.add("pointer-events-none");
    //     document.getElementById("typebox").classList.add("blur-sm");
    // }

    // function unBlurScreen() {
    //     document.getElementById("video-call-div").classList.add("hidden");
    //     document.getElementById("connect-div").classList.remove("pointer-events-none");
    //     document.getElementById("connect-div").classList.remove("blur-sm");
    //     document.getElementById("message-div").classList.remove("pointer-events-none");
    //     document.getElementById("message-div").classList.remove("blur-sm");
    //     document.getElementById("typebox").classList.remove("pointer-events-none");
    //     document.getElementById("typebox").classList.remove("blur-sm");
    // }

    // // Starts a video call.
    // function videoCall() {
    //     let videoScreen = document.getElementById("videoTestSelf");
    //     navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream) => {
    //         const videoTracks = stream.getVideoTracks();
    //         stream.onremovetrack = () => {
    //             addMessageNotification("Video chat ended.");
    //         };
    //         videoScreen.srcObject = stream;
    //         videoScreen.onloadedmetadata = () => {
    //             videoScreen.play();
    //         };

    //         // Ontrack handler.
    //         remoteConnection.ontrack = (message) => {
    //             console.log("New track")
    //         };


    //         for (const t of videoTracks) {
    //             remoteConnection.addTrack(t);
    //             console.log("added track: ");
    //             console.log(t);
    //         }



    //         blurScreen();
    //     }).catch((error) => {
    //         addMessageNotification("Error starting video chat.");
    //         });
    // }

    // function endVideoCall() {
    //     let videoEl = document.getElementById("videoTestSelf");
    //     let stream = videoEl.srcObject;
    //     const tracks = stream.getTracks();
    //     tracks.forEach((track) => {
    //         track.stop();
    //     });

    //     videoEl.srcObject = null;
    //     unBlurScreen();
    // }

    function addMessageNotification(text) {
        let mess = {id: Math.random(),
            type: "notification",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function addMessageSent(text) {
        let mess = {id: Math.random(),
            type: "sent",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function addMessageReceived(text) {
        let mess = {id: Math.random(),
            type: "received",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function sendFile() {
        const uploadFile = Object.assign(document.createElement("input"), {
            type: "file",
            style:"display:none"
        });
        uploadFile.addEventListener("change", (e) => {
            let file = e.target.files[0];
            if (file) {
                sendChan.send(file.name);
                sendChan.send(file);
                addMessageSent("You sent a file.");
            }
        })
        uploadFile.click();
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
                    {/* <button className="bg-slate-100 text-black rounded-xl p-1 text-sm mb-2 ml-1" id="video-call-btn" onClick={videoCall}>Video call</button> */}
                    <hr></hr>
                </div>
                <div id="message-div" className="overscroll-contain h-80 grow overflow-y-auto flex flex-col">
                    {messages.map((el) => {
                        if (el.type === "sent") {
                            return <SentMessage text={el.content} time={el.time} key={el.id} />
                        } else if (el.type === "received") {
                            return <ReceivedMessage text={el.content} time={el.time} key={el.id} />
                        } else if (el.type === "file") {
                            return <FileMessage blob={el.file} time={el.time} fileNameExt={messages.at(-2).content} key={el.id} /> // zoiets, laatste state item is de naam van file.
                        } else {
                            return <NotificationMessage text={el.content} key={el.id} />
                        }
                    })}
                </div>
                <Typebox sendMessage={sendMessage} sendFile={sendFile} />

                {/* <div id="video-call-div" className="hidden">
                    <video id="videoTestOther" className="absolute w-96 h-96 left-32 top-16"></video>
                    <video id="videoTestSelf" className="absolute w-96 h-96 right-32 top-16"></video>
                    <button className="absolute rounded-2xl p-2 font-bold bg-red-600 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" onClick={endVideoCall}>Stop video call</button>
                </div> */}
            </div>


        </>
    )
}
