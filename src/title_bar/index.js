import "./TitleBar.css";
import { useTranslation } from "react-i18next";
import useStore from "../store";
import { AiOutlineSetting } from "react-icons/ai";
import { MdHelpOutline } from "react-icons/md";
const { ipcRenderer } = window.require("electron");

const TitleBar = () => {
    const { t } = useTranslation();
    const { setIsPreferences } = useStore();

    return(
        <div id="titleBarContainer">
            <div id="titleBar" className="draggable">
                <span className="draggable">YT-DL-GUI</span>
                <div className="flex">
                    <div id="helpBtn">
                        <button className="nonDraggable flex items-center" onClick={() => ipcRenderer.send("SEND_OPEN_HELP", {url: "https://sffp01.github.io/yt-dl-gui/"})} >
                            <MdHelpOutline size={16} />
                            <span className="pl-2">{t("Help")}</span>
                        </button>
                    </div>
                    <div id="settingBtn">
                        <button className="nonDraggable flex items-center"  onClick={() => setIsPreferences(true)}>
                            <AiOutlineSetting size={16} />
                            <span className='pl-2'>{t("Preferences")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TitleBar;