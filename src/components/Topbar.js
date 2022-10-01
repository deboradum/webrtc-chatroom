function Topbar() {
    return (
        <div className="bg-gray-700">
            <div id="git-logo-div" className="w-10 h-10 mx-auto mt-3">
                <a href="https://github.com/deboradum/webrtc-chatroom">
                    <img  src="gitLogo.png" className="object-scale-down" alt=""></img>
                </a>
            </div>
        </div>
        // <div className="App bg-gray-700 h-screen">
        //     <p className='text-3xl text-neutral-300 pt-20 md:py-20 font-extrabold'>WebRTC chat & video room</p>
        //     <button onClick={() => navigate("/host")} className='bg-black text-white mx-20 p-3 rounded-3xl my-4 md:my-0'>Click to host a session</button>
        //     <button onClick={() => navigate("/client")} className='bg-black text-white mx-20 p-3 rounded-3xl my-4 md:my-0'>Click to join a session</button>
        //     <p className="text-white font-bold mt-10 mb-2 px-12 md:px-36">"WebRTC (Web Real-Time Communication) is a technology that enables Web applications and sites to capture and optionally stream audio and/or video media, as well as to exchange arbitrary data between browsers without requiring an intermediary."</p>
        //     <p className="text-slate-100"><a title="Learn more" href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API">mdn web docs</a></p>
        //     <div id="git-logo-div" className="w-20 h-20 mx-auto mt-16"><a href="https://github.com/deboradum/webrtc-chatroom"><img  src="gitLogo.png" className="object-scale-down" alt=""></img></a></div>
        // </div>
    );
}

export default Topbar;
