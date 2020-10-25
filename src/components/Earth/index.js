import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
import { render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import BasemapPicker from 'async!./BasemapPicker';
import Layer from 'async!../Layer';
import style from './style';
import 'cesium/Source/Widgets/widgets.css';

const Earth = (props, ref) => {
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
        <Layer viewer={globe.viewer} baseName={basePick.name} userBase={userScene.baseLayer}/>
      );
    }
    return null;
  };

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
