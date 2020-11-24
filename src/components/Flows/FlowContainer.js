import windyGlobe from './windyGlobe';
import Windy from './Windy';
const { windConfig } = require('./.setting.js');

export default function WindyContainer (props) {
    const {viewer, flowdata} = props;
    var windGlobe = windyGlobe(viewer);
    var canvas = getCanvas();
    var windy;
    var started = false;

    function getCanvas () {
        //let canvasx = document.querySelector("#cesiumContainer > div > div.cesium-viewer-cesiumWidgetContainer > div > canvas");
        let canvasx = document.getElementById("wind");
        if (!canvasx || canvasx === null) {
            canvasx = document.createElement("canvas");
            canvasx.setAttribute("id", "wind");
            canvasx.setAttribute("style", "display: block; left:0; top:0; position:absolute; z-index:3; pointer-events: none;");
            canvasx.width = parseInt(viewer.canvas.width);
            canvasx.height = parseInt(viewer.canvas.height);
            let container = document.querySelector("#cesiumContainer > div > div.cesium-viewer-cesiumWidgetContainer > div")
            container.appendChild(canvasx);
        } else {
          canvasx.width = parseInt(viewer.canvas.width);
          canvasx.height = parseInt(viewer.canvas.height);
        }
        //var context = canvas.getContext("2d");
        return canvasx;
    };

    async function initDraw () {
        await fetch(windConfig.base + 'gfs_' + flowdata.date.replace(/-/g, '') + flowdata.time + '.json')
            .then(response => response.json())
            .catch(err => console.error('Fetch Wind Json Error:', err))
            .then(data => {
                windy = new Windy({ canvas: canvas, data: data, windGlobe: windGlobe });
                redraw(windy);
            });
    };
    if (!started) initDraw();

    function redraw(windx) {
        let width = viewer.canvas.width;
        let height = viewer.canvas.height;
        let wind = document.getElementById("wind");
        wind.width = width;
        wind.height = height;
        windx.stop();

        started = windx.start(
            [[0, 0], [width, height]],
            width,
            height
        );
        wind.style.display = 'block';
    };

    function stop(windx) {
      let wind = document.getElementById("wind");
      wind.style.display = 'none';
      windx.stop();
    };

    viewer.camera.moveStart.addEventListener(function () {
        //console.log("move start...");
        let wind = document.getElementById("wind");
        wind.style.display = 'none';
        if (!!windy && started) {
            windy.stop();
        }
    });

    viewer.camera.moveEnd.addEventListener(function () {
        //console.log("move end...");
        let wind = document.getElementById("wind");
        wind.style.display = 'none';
        if (!!windy && started) {
            redraw(windy);
        }
    });

    const flow = {
        windy: windy,
        started: started,
        redraw: redraw,
        stop: stop
    };

    return flow;
};
