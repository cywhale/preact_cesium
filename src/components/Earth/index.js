import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
//import SceneMode from 'cesium/Source/Scene/SceneMode';
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
import { render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { FlowContextProvider } from "../Layer/FlowContext"; //current, flow for Windjs
import BasemapPicker from 'async!./BasemapPicker';
import WebGLGlobeDataSource from '../DataCube/WebGLGlobeDataSource';
import Layer from 'async!../Layer';
//import { EarthContext } from "./EarthContext";
import style from './style';
import 'cesium/Source/Widgets/widgets.css';

const Earth = (props, ref) => {
//const { earth, setEarth } = useContext(EarthContext);
  const [userScene, setUserScene] = useState({ baseLayer: "" });
  const [globe, setGlobe] = useState({
    loaded: false,
    baseLoaded: false,
    viewer: null
  });
  const [basePick, setBasePick] = useState({ name: "" });

  useEffect(() => {
    console.log('Initialize Viewer after appstate'); // + appstate);
    if (!globe.loaded) {
      setUserScene({ baseLayer: "NOAA ETOPO\u00a0I" });
      initGlobe();
    } else {
      render(render_basemap(), document.getElementById('rightarea'))
      render_datacube();
    }
  }, [globe.loaded]);

  const initGlobe = () => {
    setGlobe({
      loaded: true,
      viewer: new Viewer(ref.current, {
        timeline: true,
        animation: true,
        geocoder: true,
        baseLayerPicker: false,
        imageryProvider: false,
        mapProjection : new WebMercatorProjection,
      }),
    });
  };

  const render_datacube = () => {
    if (globe.loaded) {
      const dataSource = new WebGLGlobeDataSource();
      dataSource
        .loadUrl("assets/data/test/population909500.json")
        .then(function () {
        //After the initial load, create buttons to let the user switch among series.
          function createSeriesSetter(seriesName) {
            return function () {
              dataSource.seriesToDisplay = seriesName;
            };
          }
/*        for (let i = 0; i < dataSource.seriesNames.length; i++) {
            let seriesName = dataSource.seriesNames[i];
            Sandcastle.addToolbarButton(
              seriesName,
              createSeriesSetter(seriesName)
            );
         }*/
      });
      //viewer.clock.shouldAnimate = false;
      globe.viewer.dataSources.add(dataSource);
    }
  };

  const render_basemap = () => {
    if (globe.loaded) {
      const {scene} = globe.viewer;
      setGlobe((preState) => ({
        ...preState,
        baseLoaded: true,
      }));

      return (
        <BasemapPicker scene={scene} basePick={basePick} onchangeBase={setBasePick}/>
      );
    }
    return null;
  };

  const render_layer = () => {
    if (globe.loaded & globe.baseLoaded) {
      return (
        <FlowContextProvider>
          <Layer viewer={globe.viewer} baseName={basePick.name} userBase={userScene.baseLayer}/>
        </FlowContextProvider>
      );
    }
    return null;
  };

/* <canvas id="wind" class={style.canvasWind} /> */
  return (
    <Fragment>
      <div id="cesiumContainer"
          ref = {ref}
          class={style.fullSize} />
      <div id="toolbar" class={style.toolbar} />
      { render_layer() }
    </Fragment>
  );
};
export default Earth;
