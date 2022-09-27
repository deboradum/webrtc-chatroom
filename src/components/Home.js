import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    return (
        <div className="App">
            <h1 className='m-40'>WebRTC</h1>
            <button onClick={() => navigate("/host")} className='bg-black text-white mx-20 p-1 rounded'>Click to host a session</button>
            <button onClick={() => navigate("/client")} className='bg-black text-white mx-20 p-1 rounded'>Click to join a session</button>
        </div>
    );
}

export default Home;
