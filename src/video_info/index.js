import useStore from "../store";
import Modal from "react-modal";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { AiOutlineClose, AiOutlineDownload } from "react-icons/ai";
import { BsVolumeMute } from "react-icons/bs";
const { ipcRenderer } = window.require("electron");


const VideoInfo = () => {
    const { t } = useTranslation();
    const { isLoading, isVideoInfo, setIsVideoInfo, info, setInfo } = useStore();
    const [formatType, setFormatType] = useState("VIDEO");

    return(
        <Modal
            isOpen={isVideoInfo}
            ariaHideApp={false}
            style={{  
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    padding: "0px",
                    width: "320px",
                    border: isLoading ? "none" : "1px solid #ccc",
                    backgroundColor: isLoading ? "transparent" : "white",
                }
            }}
        >
            {
                isLoading ?
                <ReactLoading type="spin" className="mx-auto" color="#64748b"/>
                :
                <>
                    <div className="flex justify-between items-center text-xl">
                        <button className={`w-1/2 py-2 ${formatType === "VIDEO" ? "bg-white" : "bg-slate-200"}`} disabled={formatType === "VIDEO" ? true : false} onClick={() => setFormatType("VIDEO")}>{t("Video")}</button>
                        <button className={`w-1/2 py-2 ${formatType === "AUDIO" ? "bg-white" : "bg-slate-200"}`} disabled={formatType === "AUDIO" ? true : false} onClick={() => setFormatType("AUDIO")}>{t("Audio")}</button>
                    </div>
                    <div className="p-4">
                        <ul className="h-80 overflow-y-auto my-2">
                            {
                                info &&
                                (
                                formatType === "VIDEO" ?
                                info.videoFormats.map((format, index) => <InfoItem key={index} type="VIDEO" title={info.title} format={format} />)
                                :
                                info.audioFormats.map((format, index) => <InfoItem key={index} type="AUDIO" title={info.title} format={format} />)
                                )
                            }
                        </ul>
                        <div className="flex justify-end items-center mt-4">
                            <button className="flex justofy-center items-center" onClick={() => {
                                setIsVideoInfo(false);
                                setInfo(null);
                            }}>
                                <AiOutlineClose size={16} />
                                <span className="pl-2 text-base">{t("Close")}</span>
                            </button>
                        </div>
                    </div>
                </>
            }
        </Modal>
    );
};

const InfoItem = (props) => {
    const { t } = useTranslation();
    const { type, title, format } = props;
    
    return(
        <li className="text-sm flex justify-between items-center py-2">
            <div className="flex items-center">
                <span className="mr-2">{type === "VIDEO" ? format.qualityLabel : format.audioBitrate}</span>
                {
                    type === "VIDEO" &&
                    (
                        !format.hasAudio && <BsVolumeMute size={16} />
                    )
                }
            </div>
            <div className="flex items-center">
                <span>{format.container}</span>
                <button className="flex items-center ml-4" onClick={() => ipcRenderer.send("SEND_ADD_QUEUE", {
                    title: title,
                    downloadURL: format.url,
                    container: format.container,
                })}>
                    <AiOutlineDownload size={20} />
                    <span>{t("Download")}</span>
                </button>
            </div>
        </li>
    );
};

export default VideoInfo;