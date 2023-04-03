import './App.css';
import Search from './search';
import TitleBar from './title_bar';
import Webview from './webview';
import Preferences from './preferences';
import VideoInfo from './video_info';
import Queue from './queue';

function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <TitleBar />
      <div className="h-14" />
      <Search />
      <Webview />
      <Preferences />
      <VideoInfo />
      <Queue />
    </div>
  );
}

export default App;