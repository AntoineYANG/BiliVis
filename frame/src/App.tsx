/*
 * @Author: Antoine YANG 
 * @Date: 2019-12-23 20:04:44 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-12-25 22:34:50
 */

import React from 'react';
import './App.css';
import { VideoView } from './VideoView';
import { Home } from './Home';
import $ from 'jquery';
import { BrowserRouter, Route } from 'react-router-dom';


const App: React.FC = () => {
  return (
    <div className="App">
      <div id="containerMain"
      style={{
        backgroundImage: 'url("./images/background0.jpg")'
      }} >
        <BrowserRouter>
          {/* <Link to="/">HOME</Link>
          <Link to="/video">VIDEO</Link> */}
          <Route exact path="/" component={Home} />
          <Route path="/video" component={VideoView} />
        </BrowserRouter>
      </div>
    </div>
  );
}

$(window).scroll(() => {
  $("#pageBackground").css("top", $(window).scrollTop()!);
});

export default App;
