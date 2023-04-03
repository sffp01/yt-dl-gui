import useStore from '../store';
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { AiOutlineArrowRight, AiOutlineDownload } from "react-icons/ai";
const { ipcRenderer } = window.require("electron");

const Search = () => {
    const { t } = useTranslation();
    const { url, setURL, setIsLoading, setInfo, setIsVideoInfo } = useStore();

    useEffect(() => {
        ipcRenderer.on("REPLY_GET_INFO", (event, args) => {
            setInfo(args.info);
            !args.info && setIsVideoInfo(false);
            args.info && setIsLoading(false);
        });
    }, [setInfo, setIsLoading, setIsVideoInfo]);

    return(
        <div className='flex justify-between items-center h-16'>
            <div className='w-full h-10 flex justify-between items-center px-4 ml-4 bg-slate-50 text-slate-900 rounded-md border border-slate-900'>
                <input value={url} onChange={e => setURL(e.target.value)} onKeyUp={e => e.key === "Enter" && (document.querySelector("webview").src = url.indexOf("http") === -1 ? `http://${url}` : url)} className='w-full outline-none text-base bg-transparent' placeholder='URL을 입력하세요.' />
                <button onClick={() => (document.querySelector("webview").src = url.indexOf("http") === -1 ? `http://${url}` : url)} className='text-slate-400 hover:text-slate-900 pl-2'>
                    <AiOutlineArrowRight size={16} />
                </button>
            </div>
            <button className='flex justify-between items-center w-36 h-full px-4 text-slate-900' onClick={() => {
                setIsVideoInfo(true);
                setIsLoading(true);
                ipcRenderer.send("SEND_GET_INFO", {videoURL: url});
            }}>
               <AiOutlineDownload size={16} />
               <span className='pl-1 text-base'>{t("Download")}</span>
            </button>
        </div>
    );
};

export default Search;