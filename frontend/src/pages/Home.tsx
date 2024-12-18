import { useState } from "react";
import ChatDrawer from "../components/ChatDrawer";
import Navbar from "../components/Navbar";

const Home = () => {
  const [fetchAgain, setFetchAgain] = useState(true)
  return (
    <div className="w-full h-[100%]">
      <Navbar />
      <ChatDrawer fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
    </div>
  );
};

export default Home;
