import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { AiOutlineDownload, AiOutlineClear, AiOutlineFolderOpen, AiOutlineClose } from "react-icons/ai";
const { ipcRenderer } = window.require("electron");

const Queue = () => {
    const { t } = useTranslation();
    const [isDownload, setIsDownload] = useState(null);
    const [autoDownload, setAutoDownload] = useState(false);
    const [queue, setQueue] = useState(new Map());
    const [queueInterval, setQueueIntelval] = useState(null);

    useEffect(() => {
        ipcRenderer.on("REPLY_GET_AUTO_DOWNLOAD", (event, args) => setAutoDownload(args.autoDownload));
        ipcRenderer.send("SEND_GET_AUTO_DOWNLOAD");
    }, []);

    useEffect(() => {
        ipcRenderer.on("REPLY_GET_QUEUE", (event, args) => setQueue(args.queue));
        ipcRenderer.send("SEND_GET_QUEUE");
    }, []);

    useEffect(() => {
        ipcRenderer.on("REPLY_DOWNLOAD", (event, args) => setIsDownload(args.isDownload));
    }, []);

    useEffect(() => {
        isDownload === "DOWNLOADING" && setQueueIntelval(setInterval(() => {
            ipcRenderer.send("SEND_GET_QUEUE");
            ipcRenderer.send("SEND_GET_STATE");
        }, 1000));
    }, [isDownload]);

    useEffect(() => {
        if(queueInterval !== null){
            if(isDownload === null || isDownload === "PAUSE"){
                clearInterval(queueInterval);
                setQueueIntelval(null);
            };
            if(isDownload === null && autoDownload){
                ipcRenderer.send("SEND_DOWNLOAD");
            };
        };
    }, [isDownload, autoDownload, queueInterval]);


    return(
        <div className="h-72 p-4">
            <div className="w-full h-full bg-slate-50 rounded-md border border-slate-900">
                <div className="flex justify-end w-full h-12 border-b border-slate-900 px-4">
                    <div className='flex'>
                        {
                            isDownload === null || isDownload === "PAUSE" ?
                            <button className='flex items-center' onClick={() => ipcRenderer.send("SEND_DOWNLOAD")}>
                                <AiOutlineDownload size={16} />
                                <span className='text-base pl-2 cursor-pointer'>{t("Download")}</span>
                            </button>
                            :
                            <button className='flex items-center' onClick={() => ipcRenderer.send("SEND_PAUSE")}>
                                <AiOutlineDownload size={16} />
                                <span className='text-base pl-2 cursor-pointer'>{t("Pause")}</span>
                            </button>
                        }
                        <button className='flex items-center ml-4' onClick={() => ipcRenderer.send("SEND_REMOVE_DOWNLOADED_QUEUE")}>
                            <AiOutlineClear size={16} />
                            <span className='text-base pl-2'>{t("Clear")}</span>
                        </button>
                        <div className="flex justify-between items-center ml-4">
                            <input id="autoDownload" checked={autoDownload} onChange={e => {
                                setAutoDownload(e.target.checked);
                                ipcRenderer.send("SEND_CHANGE_AUTO_DOWNLOAD", {autoDownload: e.target.checked});
                            }} className='cursor-pointer' type="checkbox" />
                            <label htmlFor="autoDownload" className="text-base pl-2 cursor-pointer">{t("Auto download")}</label>
                        </div>
                    </div>
                </div>
                <ul
                    className='h-48 overflow-y-auto my-2'
                >
                    {
                        [...queue].map(([queueID, data], index) => <QueueItem key={index} queueID={queueID} data={data} />)
                    }
                </ul>
            </div>
        </div>
    );
};

const QueueItem = (props) => {
    const { t } = useTranslation();
    const { queueID, data } = props;

    return(
        <li className='flex justify-between items-center text-sm p-4'>
            <span title={data.title} className='flex-1 truncate pr-2'>
                {data.title}
            </span>
            <div className='flex justify-between items-center w-54'>
                <span>{
                    data.receivedBytes === 0 ?
                    "0%"
                    :
                    `${((data.receivedBytes/data.totalBytes) * 100).toFixed(2)}%`
                }</span>
                <button className='flex items-center mx-4' onClick={() => ipcRenderer.send("SEND_OPEN_OUTPUT", {output: data.output})}>
                    <AiOutlineFolderOpen size={16} />
                    <span className='pl-2'>{t("Open folder")}</span>
                </button>
                <button className='flex items-center' onClick={() => {
                    if(data.isState === "DOWNLOADING"){
                        let result = window.confirm(t("You are downloading a video, would you like to stop it?"));
                        result && ipcRenderer.send("SEND_REMOVE_QUEUE", {queueID: queueID});
                    }else{
                        ipcRenderer.send("SEND_REMOVE_QUEUE", {queueID: queueID});
                    };
                }}>
                    <AiOutlineClose size={16} />
                    <span className='pl-2'>{t("Remove")}</span>
                </button>
            </div>
        </li>
    );
};

export default Queue;