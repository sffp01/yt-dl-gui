import "./TitleBar.css";
import { useTranslation } from "react-i18next";
import useStore from "../store";
import { AiOutlineSetting } from "react-icons/ai";

const TitleBar = () => {
    const { t } = useTranslation();
    const { setIsPreferences } = useStore();

    return(
        <div id="titleBarContainer">
            <div id="titleBar" className="draggable">
                <span className="draggable">YT-DL-GUI</span>
                <div id="settingBtn">
                    <button className="nonDraggable flex items-center"  onClick={() => setIsPreferences(true)}>
                        <AiOutlineSetting size={16} />
                        <span className='pl-2'>{t("Preferences")}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TitleBar;