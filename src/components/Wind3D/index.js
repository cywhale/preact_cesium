//This codebase of direcotry (Wind3D) is sourced from https://github.com/RaymanNg/3D-Wind-Field
//  and modified for preact framework by cywhale
//  Codebase version: 20201113 updated
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import SceneMode from 'cesium/Source/Scene/SceneMode';
import DataProcess from './dataProcess.js';
import ParticleSystem from './particleSystem.js';
import Util from './util.js';
const { userInput } = require('./gui.js');

export default class Wind3D {
    constructor(viewer) { //panel, mode
        const { scene, camera } = viewer; // add by cywhale
        const mode = { // add by cywhale
            debug: false
        };
/*      var options = {
            baseLayerPicker: false,
            geocoder: false,
            infoBox: false,
            fullscreenElement: 'cesiumContainer',
            scene3DOnly: true
        }

        if (mode.debug) {
            options.useDefaultRenderLoop = false;
        }*/
// modified by cywhale
        this.viewer = viewer; //new Cesium.Viewer('cesiumContainer', options);
        this.scene = scene;   //this.viewer.scene;
        this.camera = camera; //this.viewer.camera;

        this.panel = null; //panel;
// ================================
        this.viewerParameters = {
            lonRange: new Cartesian2(), //Cesium.
            latRange: new Cartesian2(), //Cesium.
            pixelSize: 0.0
        };
        // use a smaller earth radius to make sure distance to camera > 0
        this.globeBoundingSphere = new BoundingSphere(Cartesian3.ZERO, 0.99 * 6378137.0); //Cesium.
        this.updateViewerParameters();

        DataProcess.loadData().then(
            (data) => {
                this.particleSystem = new ParticleSystem(this.scene.context, data,
                    userInput, //this.panel.getUserInput(), //modified by cywhale
                    this.viewerParameters);
                this.addPrimitives();

                this.setupEventListeners();
/* modified by cywhale
                if (mode.debug) {
                    this.debug();
                }*/
            });

        this.imageryLayers = this.viewer.imageryLayers;
        //this.setGlobeLayer(this.panel.getUserInput()); //modified by cywhale
    }

    addPrimitives() {
        // the order of primitives.add() should respect the dependency of primitives
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.calculateSpeed);
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition);
        this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition);

        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments);
        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails);
        this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen);
    }

    updateViewerParameters() {
        var viewRectangle = this.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
        this.viewerParameters.lonRange.x = lonLatRange.lon.min;
        this.viewerParameters.lonRange.y = lonLatRange.lon.max;
        this.viewerParameters.latRange.x = lonLatRange.lat.min;
        this.viewerParameters.latRange.y = lonLatRange.lat.max;

        var pixelSize = this.camera.getPixelSize(
            this.globeBoundingSphere,
            this.scene.drawingBufferWidth,
            this.scene.drawingBufferHeight
        );

        if (pixelSize > 0) {
            this.viewerParameters.pixelSize = pixelSize;
        }
    }
/* modified by cywhale
    setGlobeLayer(userInput) {
        this.viewer.imageryLayers.removeAll();
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

        var globeLayer = userInput.globeLayer;
        switch (globeLayer.type) {
            case "NaturalEarthII": {
                this.viewer.imageryLayers.addImageryProvider(
                    new Cesium.TileMapServiceImageryProvider({
                        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
                    })
                );
                break;
            }
            case "WMS": {
                this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                    url: userInput.WMS_URL,
                    layers: globeLayer.layer,
                    parameters: {
                        ColorScaleRange: globeLayer.ColorScaleRange
                    }
                }));
                break;
            }
            case "WorldTerrain": {
                this.viewer.imageryLayers.addImageryProvider(
                    Cesium.createWorldImagery()
                );
                this.viewer.terrainProvider = Cesium.createWorldTerrain();
                break;
            }
        }
    }
*/
    setupEventListeners() {
        const that = this;

        this.camera.moveStart.addEventListener(function () {
            that.scene.primitives.show = false;
        });

        this.camera.moveEnd.addEventListener(function () {
            that.updateViewerParameters();
            that.particleSystem.applyViewerParameters(that.viewerParameters);
            that.scene.primitives.show = true;
        });

        var resized = false;
        window.addEventListener("resize", function () {
            resized = true;
            that.scene.primitives.show = false;
            that.scene.primitives.removeAll();
        });

        this.scene.preRender.addEventListener(function () {
            if (resized) {
                that.particleSystem.canvasResize(that.scene.context);
                resized = false;
                that.addPrimitives();
                that.scene.primitives.show = true;
            }
        });
/*
        this.scene.morphStart.addEventListener(function(ignore, previousMode, newMode) {
          if (newMode !== SceneMode.SCENE3D) {
            that.scene.primitives.show = false;
            that.scene.primitives.removeAll();
          }
        });
        this.scene.morphComplete.addEventListener(function(ignore, previousMode, newMode) {
          if (newMode === SceneMode.SCENE3D) {
            if (that.particleSystem) {
              that.particleSystem.canvasResize(that.scene.context);
              resized = false;
            }
          }
        });*/
/* modified by cywhale
        window.addEventListener('particleSystemOptionsChanged', function () {
            that.particleSystem.applyUserInput(that.panel.getUserInput());
        });
        window.addEventListener('layerOptionsChanged', function () {
            that.setGlobeLayer(that.panel.getUserInput());
        });*/
    }
/* modified by cywhale
    debug() {
        const that = this;

        var animate = function () {
            that.viewer.resize();
            that.viewer.render();
            requestAnimationFrame(animate);
        }

        var spector = new SPECTOR.Spector();
        spector.displayUI();
        spector.spyCanvases();

        animate();
    }
*/
};
