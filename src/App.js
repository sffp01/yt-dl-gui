import { useEffect, useState } from 'react';
import './App.css';
import ReactMarkdown from "react-markdown";
import { MdLanguage } from "react-icons/md"
import { AiFillGithub } from "react-icons/ai"

function App() {
  const [ windowSize, setWindowSize ] = useState({w: window.innerWidth, h: window.innerHeight});
  const [ toc, setToc ] = useState(null);
  const [ language, setLanguage ] = useState("en");
  const [ mdName, setMdName ] = useState("Home");
  const [ mdString, setMdString ] = useState("");
  useEffect(() => {
    window.onresize = () => setWindowSize({w: window.innerWidth, h: window.innerHeight});
  }, []);

  useEffect(() => {
    fetch(`/yt-dl-gui/md/toc.json`).then(res => res.json()).then(value => setToc(value));
  }, []);

  useEffect(() => {
    fetch(`/yt-dl-gui/md/${language}/${mdName}.md`).then(res => res.text()).then(value => setMdString(value));
  }, [mdName, language]);

  return (
    <div style={{ 
      width: windowSize.w, 
      height: windowSize.h,
      backgroundColor: "#f1f5f9"
    }}>
      <header
        style={{ 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed", 
          width: "100%", 
          height: 56, 
          backgroundColor: "white",
          boxShadow: "0px 1px 0px 2px #cbd5e1"
        }}
      >
        <div style={{marginLeft: 24}}>
          <span style={{fontSize: 20, fontWeight: 600}}>YT-DL-GUI</span>
        </div>
        <div style={{ display: "flex", marginRight: 24 }}>
          <div style={{ display: "flex", alignItems: "center", marginRight: 16 }}>
            <MdLanguage style={{ paddingRight: 4 }} size={24} />
            <select style={{ fontSize: 16, border: "none", backgroundColor: "transparent", cursor: "pointer" }} value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <a href='https://github.com/sffp01/yt-dl-gui' target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "black" }}>
            <AiFillGithub style={{ paddingRight: 4 }} size={24} />
            <span style={{fontSize: 16}}>GitHub</span>
          </a>
        </div>
      </header>
      <div style={{ height: 56 }} />
      <div style={{ display: "flex", justifyContent: "center", height: windowSize.h -56 }}>
        <div style={{ width: windowSize.w >= 1080 ? 1080 : 958, display: "flex" }}>
          <aside
            style={{
              width: 240,
            }}
          >
            <ul style={{ listStyle: "none", padding: 24, margin: 0 }}>
              {
                toc &&
                toc[language].map((item, index) => 
                  <li style={{fontSize: 16, fontWeight: 600, padding: "8px 0px", cursor: "pointer" }} key={index} onClick={() => setMdName(item.mdName)}>{item.label}</li>
                )
              }
            </ul>
          </aside>
          <main
            style={{ flex: 1, backgroundColor: "white", padding: 32, overflowY: "auto", boxShadow: "0px 1px 1px 1px #cbd5e1" }}
          >
            <ReactMarkdown>{mdString}</ReactMarkdown>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
