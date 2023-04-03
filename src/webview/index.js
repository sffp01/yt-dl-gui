import { useEffect, useState } from "react";
import useStore from "../store";

const Webview = () => {
    const { setURL } = useStore();
    const [screenH, setScreenH] = useState(window.innerHeight);

    useEffect(() => {
        window.addEventListener("resize", () => setScreenH(window.innerHeight));
    }, [ setScreenH ]);

    useEffect(() => {
        document.querySelector("webview").addEventListener("did-stop-loading", e => setURL(e.target.src));
    }, [setURL]);

    return(
        <div className="px-4">
            <webview 
                className="border border-slate-900"
                style={{height: screenH -408}}
                src="https://m.youtube.com/"
                useragent="Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19" 
            />
        </div>
    );
};

export default Webview;