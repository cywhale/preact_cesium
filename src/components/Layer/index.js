import { Fragment } from 'preact';
import { useState, useEffect, useContext } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
import defined from 'cesium/Source/Core/defined.js';
import SceneMode from 'cesium/Source/Scene/SceneMode';
import style from './style_modal';
import LayerModal from 'async!./LayerModal';
import Datepicker from 'async!../Datepicker';
import { EarthContext } from "../Earth/EarthContext";
import MultiSelectSort from 'async!../MultiSelectSort';
import Wind3D from '../Wind3D';

const Layer = (props) => {
  const { viewer, baseName, userBase } = props;
  const { scene } = viewer;
  const { earth, setEarth } = useContext(EarthContext);
  const [model3d, setModel3d] = useState({
    wind: null,
    initScene3D: false,
    initEventTrig: false,
  });

  const render_ImgLayer = () => {
    return(<LayerModal viewer={viewer} baseName={baseName} userBase={userBase} />);
  }
//========== Handle Wind3d model ===============
  const destroyWind3D = (wind) => {
    if (wind) {
      wind.scene.primitives.show = false;
      wind.scene.primitives.removeAll();
      wind.scene.preRender._listeners = [];
    //Object.keys(model3d.wind).forEach(function(key) { delete model3d.wind[key]; });
    }
  }

  const handleWind3D = async (selwind, scenex) => {
    //const {scene} = viewer;
    if (selwind && model3d.wind === null && scenex.mode === SceneMode.SCENE3D) {
      await setModel3d((preMdl) => ({
          ...preMdl,
          wind: new Wind3D(viewer),
          initScene3D: true,
      }));
    } //else {
    /*
    if (!model3d.initEventTrig) {
      await setModel3d((preMdl) => ({
          ...preMdl,
          initEventTrig: true,
      }));
    */
    //const {context} = scene;
    //https://stackoverflow.com/questions/29263166/how-to-get-scene-change-events-in-cesium
      await scenex.morphStart.addEventListener(function(ignore, previousMode, newMode) {
        if (earth.selwind && model3d.initScene3D && newMode !== SceneMode.SCENE3D) {
          destroyWind3D(model3d.wind);
          setModel3d((preMdl) => ({
            ...preMdl,
            wind: null
          }));
        }
      });
      await scenex.morphComplete.addEventListener(function(ignore, previousMode, newMode) {
        if (earth.selwind && model3d.wind === null && newMode === SceneMode.SCENE3D) {
          setModel3d((preMdl) => ({
            ...preMdl,
            wind: new Wind3D(viewer),
            initScene3D: true,
          }));
        }
      });
    //}
  }

  const deselModel3D = async (selwind, scenemode3d) => {
    if (!selwind && model3d.initScene3D && scenemode3d && model3d.wind !== null) { //unselected
        destroyWind3D(model3d.wind);
        await setModel3d((preMdl) => ({
          ...preMdl,
          //initScene3D: false,
          wind: null
        }));
    }
  };//, []);

  const initModel3D = async (selwind, scenex) => {
    if (!model3d.initScene3D && scenex.mode === SceneMode.SCENE3D) {
        await setModel3d((preMdl) => ({
          ...preMdl,
          wind: new Wind3D(viewer),
          initScene3D: true,
        }));
    } else {
        await handleWind3D(selwind, scenex);
    }
  };

  useEffect(() => {
    if (!earth.loaded) {
      console.log("Test basemaplayer name: ", baseName, " & ", userBase);
      setEarth((preState) => ({
        ...preState,
        loaded: true,
      }));
    } else {
      //var wind3D = new Wind3D(globe.viewer);
      if (earth.selwind) {
        initModel3D(earth.selwind, scene);
      } else {
        deselModel3D(earth.selwind, scene.mode === SceneMode.SCENE3D);
      }
    }
  }, [earth.loaded, earth.selwind, scene.mode, initModel3D]);

  return (
    <Fragment>
      <div class={style.toolToggle}>
         <a class={style.toolButn} href="#ctrl"><i></i></a>
      </div>
      <div id="ctrl" class={style.modalOverlay}>
        <div class={style.modalHeader} id="ctrlheader">
          Contrl clustering
          <a href="#" class={style.close}>&times;</a>
        </div>
        <div class={style.modal}>
          <div class={style.ctrlwrapper}>
            <section class={style.ctrlsect}>
              <div class={style.ctrlcolumn}>
                <div><MultiSelectSort /></div>
                <div id="ctrlsectdiv1" />
                <div id="ctrlsectdiv2">
                  { render_ImgLayer() }
                </div>
                <div><Datepicker viewer={viewer} /></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Layer;
