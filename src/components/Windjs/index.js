//import { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'preact/hooks';
//import { EarthContext } from "../Earth/EarthContext";
//import canvas2globe from './canvas2globe.js';
const { windConfig } = require('./.setting.js');
import Windy from './Windy';
//import style from './style';

const Windjs = (props) => {
  const { viewer, enable, gfsdate, gfstime, loaded, started, windy } = props;
  //const { earth, setEarth } = useContext(EarthContext);
  const windjs  = { //[ windjs, setWindjs ] = useState({
    loaded: loaded,
    started: started,
    windy: windy,
  }//);
  //const windRef = useRef(null);

  const fetchWindData = () => { //(windom, windGlobe) => { //useCallback((windom) => {
    fetch(windConfig.base + 'gfs_' + gfsdate.replace(/-/g, '') + gfstime + '.json',
    ).then(response => response.json())
     .catch(err => console.error('Fetch Wind Json Error:', err))
     .then(data => {
        //setWindjs(preState => ({
        //  ...preState,
        windjs.windy = new Windy(data, viewer); //({ canvas: windom, data: data, windGlobe: windGlobe });
        windjs.loaded = true;

        setInterval(function () {
          windjs.windy.animate();
        }, 300);
        //}));
     });
  };//, [gfsdate]);
/*
  const redraw_windy = (windom) => {
    let width = viewer.canvas.width;
    let height = viewer.canvas.height;
    windom.width = width;
    windom.height = height;
    windjs.windy.stop();

    //setWindjs(preState => ({
    //  ...preState,
    windjs.started = windjs.windy.start(
            [[0, 0], [width, height]],
            width,
            height
      );
    //}));
    windom.style.display = 'block';
  }

  const eventTrig_windy = (windom) => {
    viewer.camera.moveStart.addEventListener(function () {
      //console.log("move start...");
      windom.style.display = 'none';
      if (!!windjs.windy && windjs.started) {
        windjs.windy.stop();
      }
    });
    viewer.camera.moveEnd.addEventListener(function () {
      //console.log("move end...");
      windom.style.display = 'none';
      if (!!windjs.windy && windjs.started) {
        windjs.windy.redraw();
      }
    });
  }
*/
  //useEffect(() => {
  if (enable) {
/*    const windGlobe = canvas2globe(viewer);
      const windom = document.getElementById("wind");
      windom.width = parseInt(viewer.canvas.width);
      windom.height = parseInt(viewer.canvas.height);
*/
      if (!windjs.loaded) {
        fetchWindData(); //windom, windGlobe);
      } /*else {
        if (!windjs.started) {
          redraw_windy(windom);
          eventTrig_windy(windom);
        }
      }
  } else {
    if (!!windjs.windy && windjs.started) {
      windom.style.display = 'none';
      windjs.windy.stop();
      windjs.started = false;
    }*/
  }
  return (windjs.loaded);
  //}, [windRef.current, windjs.loaded]);
  /*
  return useMemo (() => {
    return(
      <canvas id="wind" class={style.canvasWind} ref={windRef} />
    );
  }, []);*/
};
export default Windjs;
