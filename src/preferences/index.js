import Modal from "react-modal"
import useStore from "../store";
import { useEffect } from "react";
import { useState } from "react";
import i18next from "../i18next";
import { useTranslation } from "react-i18next";
import { AiOutlineClose, AiOutlineFolder, AiOutlineFolderOpen, AiOutlineUndo,  } from "react-icons/ai";
import { MdHelpOutline } from "react-icons/md";
const { ipcRenderer } = window.require("electron");

const Preferences = () => {
    const { t } = useTranslation();
    const { language, setLanguage, isPreferences, setIsPreferences } = useStore();
    const [ output, setOutput ] = useState("");

    useEffect(() => {
        ipcRenderer.on("REPLY_GET_LANGUAGE", (event, args) => setLanguage(args.language === "ko" ? "ko" : "en"));
        ipcRenderer.send("SEND_GET_LANGUAGE");
    }, [setLanguage]);

    useEffect(() => {
        ipcRenderer.on("REPLY_GET_OUTPUT", (event, args) => setOutput(args.output));
        ipcRenderer.send("SEND_GET_OUTPUT");
    }, []);

    useEffect(() => {
        i18next.changeLanguage(language);
    }, [language]);

    return(
        <Modal
            isOpen={isPreferences}
            ariaHideApp={false}
            style={{  
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    padding: "16px",
                    width: "560px",
                }
            }}
        >
            <div className="flex justify-between items-center">
                <label htmlFor="version" className="text-slate-900 text-base">{t("Version")}</label>
                <div className="text-sm text-slate-900 px-4" id="version">
                    <span>{ process.env.REACT_APP_VERSION }</span>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <label htmlFor="languageSelector" className="text-base">{t("Language")}</label>
                <select value={language} onChange={e => {
                    setLanguage(e.target.value);
                    ipcRenderer.send("SEND_CHANGE_LANGUAGE", {language: e.target.value});
                }} id="languageSelector" className="cursor-pointer text-sm">
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                </select>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="outputPath" style={{width: "100px"}} className="text-base">{t("Path")}</label>
                    <div className="flex-1 text-sm text-slate-50 ml-4 px-4 py-2 bg-slate-500 rounded-md" id="outputPath">
                        <span>{ output }</span>
                    </div>
                </div>
                <div className="flex justify-end items-center">
                    <div style={{width: "320px"}} className="mt-2 flex justify-between items-center text-sm">
                        <button className="flex items-center" onClick={() => ipcRenderer.send("SEND_CHANGE_OUTPUT")}>
                            <AiOutlineFolder size={16} />
                            <span className="pl-2">{t("Change path")}</span>
                        </button>
                        <button className="flex items-center" onClick={() => ipcRenderer.send("SEND_OPEN_OUTPUT")}>
                            <AiOutlineFolderOpen size={16} />
                            <span className="pl-2">{t("Open folder")}</span>
                        </button>
                        <button className="flex items-center" onClick={() => ipcRenderer.send("SEND_RESET_OUTPUT")}>
                            <AiOutlineUndo size={16} />
                            <span className="pl-2">{t("Reset path")}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center mt-4">
                <MdHelpOutline size={16} />
                <button className="text-sm text-slate-900 pl-2" onClick={() => ipcRenderer.send("SEND_OPEN_HELP", {url: "https://sffp01.github.io/yt-dl-gui/"})} >{t("Help")}</button>
            </div>
            <div className="flex justify-end items-center mt-4">
                <button className="flex justofy-center items-center" onClick={() => setIsPreferences(false)}>
                    <AiOutlineClose size={16} />
                    <span className="pl-1 text-base">{t("Close")}</span>
                </button>
            </div>
        </Modal>
    );
};

export default Preferences;