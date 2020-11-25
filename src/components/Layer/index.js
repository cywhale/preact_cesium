import { render, Fragment } from 'preact';
import { useState, useEffect, useContext, useRef } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
import defined from 'cesium/Source/Core/defined.js';
import SceneMode from 'cesium/Source/Scene/SceneMode';
import style from './style_modal';
import LayerModal from 'async!./LayerModal';
import Datepicker from 'async!../Datepicker';
import { EarthContext } from "../Earth/EarthContext";
import { FlowContext } from "./FlowContext"; //current, flow for Windjs
import MultiSelectSort from 'async!../MultiSelectSort';
import Wind3D from '../Wind3D';
import FlowContainer from '../Flows/FlowContainer';
import WebGLGlobeDataSource from '../DataCube/WebGLGlobeDataSource';

const Layer = (props) => {
  const { viewer, baseName, userBase } = props;
  const { scene } = viewer;
  const multiselRef = useRef(null);
  const { earth, setEarth } = useContext(EarthContext);
  const { flow, setFlow } = useContext(FlowContext);

  const [model3d, setModel3d] = useState({
    wind: null,
    initScene3D: false,
    initCurrEvent: false,
    cube_demo1: -1, // demo data_cube (population temp)
    cube_demolayer: null,
  });
  const [curr, setCurr] = useState(null);

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

  const render_windjs = async (enable) => {
    if (enable && curr === null) {
      const params = {viewer: viewer, flowdata: {date: '2018-06-25', time: '00'}}; //2014-11-30
      //const flowx = FlowContainer(params);
      await setCurr(new FlowContainer(params)); //flowx
    } else if (enable) {
      let wind = document.getElementById("wind");
      if (wind.style.display === 'none') {
        await curr.redraw();
      }
    } else if (!enable && curr !== null) {
      await curr.stop();
    }
  };

  const render_datacube = (enable) => {
    if (enable && model3d.cube_demolayer === null) {
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
//        for (let i = 0; i < dataSource.seriesNames.length; i++) {
//            let seriesName = dataSource.seriesNames[i];
//            Sandcastle.addToolbarButton(
//              seriesName,
//              createSeriesSetter(seriesName)
//            );
//       }
      });
      //viewer.clock.shouldAnimate = false;
      viewer.dataSources.add(dataSource);
      setModel3d((preMdl) => ({
          ...preMdl,
          cube_demo1: viewer.dataSources._dataSources.length - 1,
          cube_demolayer: dataSource, //viewer.dataSources._dataSources[model3d.cube_demo1]._seriesToDisplay,
      }));
    } else if (enable && model3d.cube_demolayer !== null && model3d.cube_demo1 === -1) {
      //viewer.dataSources._dataSources[model3d.cube_demo1]._seriesToDisplay = model3d.cube_demolayer;
      //viewer.dataSources._dataSources[model3d.cube_demo1].show = true;
      //model3d.cube_demolayer.show = true;
      if (!viewer.dataSources.contains(model3d.cube_demolayer)) {
        viewer.dataSources.add(model3d.cube_demolayer);
        setModel3d((preMdl) => ({
            ...preMdl,
            cube_demo1: viewer.dataSources._dataSources.length - 1,
        }));
      }
    } else if (!enable && model3d.cube_demo1 >= 0) {
      //viewer.dataSources._dataSources[model3d.cube_demo1]._seriesToDisplay='';
      //viewer.dataSources._dataSources[model3d.cube_demo1].show = false;
      //model3d.cube_demolayer.show = false;
      if (viewer.dataSources.contains(model3d.cube_demolayer)) {
        viewer.dataSources.remove(model3d.cube_demolayer);
        setModel3d((preMdl) => ({
          ...preMdl,
          cube_demo1: -1,
        }));
      }
    }
  };
/*const addDemoListener = () => {
          let chkdemo1 = document.getElementById("rdts1-2-0-0");
          if (chkdemo1 !== null) {
            //chkdemo1.addEventListener('change', function() {
              render_datacube(chkdemo1.checked);
            //console.log("Checkbox is checked: ", this.checked);
            //});
          }
  }
*/
  useEffect(() => {
    if (!earth.loaded) {
      console.log("Test basemaplayer name: ", baseName, " & ", userBase);
      setEarth((preState) => ({
        ...preState,
        loaded: true,
      }));
    } else {
      //var wind3D = new Wind3D(globe.viewer);
      if (multiselRef.current) {
        if (earth.selwind) {
          initModel3D(earth.selwind, scene);
        } else {
          deselModel3D(earth.selwind, scene.mode === SceneMode.SCENE3D);
        }
        render_windjs(flow.selcurr);

        //if (earth.selReady) { addDemoListener(); } //&& model3d.cube_demo1 === -1
        render_datacube(earth.selReady); // temp used
      }
    }
  }, [earth.loaded, earth.selwind, scene.mode, multiselRef.current, initModel3D,
      render_windjs, render_datacube]); //earth.selReady

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
                <div ref={multiselRef}><MultiSelectSort /></div>
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
