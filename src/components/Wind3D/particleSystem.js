import Color from 'cesium/Source/Core/Color.js';
import ClearCommand from 'cesium/Source/Renderer/ClearCommand.js';
import Pass from 'cesium/Source/Renderer/Pass.js';
import VertexArray from 'cesium/Source/Renderer/VertexArray.js';
import BufferUsage from 'cesium/Source/Renderer/BufferUsage.js';
import ParticlesComputing from './particlesComputing.js'
import ParticlesRendering from './particlesRendering.js'
//const { userInput } = require('./gui.js');

export default class ParticleSystem {
    constructor(context, data, userInput, viewerParameters) {
        this.context = context;
        this.data = data;
        this.userInput = userInput;
        this.viewerParameters = viewerParameters;

        this.particlesComputing = new ParticlesComputing(
            this.context, this.data,
            this.userInput, this.viewerParameters
        );
        this.particlesRendering = new ParticlesRendering(
            this.context, this.data,
            this.userInput, this.viewerParameters,
            this.particlesComputing
        );
    }

    canvasResize(context) {
        this.particlesComputing.destroyParticlesTextures();
        Object.keys(this.particlesComputing.windTextures).forEach((key) => {
            this.particlesComputing.windTextures[key].destroy();
        });

        Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
            this.particlesRendering.framebuffers[key].destroy();
        });

        this.context = context;
        this.particlesComputing = new ParticlesComputing(
            this.context, this.data,
            this.userInput, this.viewerParameters
        );
        this.particlesRendering = new ParticlesRendering(
            this.context, this.data,
            this.userInput, this.viewerParameters,
            this.particlesComputing
        );
    }

    clearFramebuffers() {
        var clearCommand = new ClearCommand({ //Cesium.
            color: new Color(0.0, 0.0, 0.0, 0.0), //Cesium.
            depth: 1.0,
            framebuffer: undefined,
            pass: Pass.OPAQUE //Cesium.
        });

        Object.keys(this.particlesRendering.framebuffers).forEach((key) => {
            clearCommand.framebuffer = this.particlesRendering.framebuffers[key];
            clearCommand.execute(this.context);
        });
    }

    refreshParticles(maxParticlesChanged) {
        this.clearFramebuffers();

        this.particlesComputing.destroyParticlesTextures();
        this.particlesComputing.createParticlesTextures(this.context, this.userInput, this.viewerParameters);

        if (maxParticlesChanged) {
            var geometry = this.particlesRendering.createSegmentsGeometry(this.userInput);
            this.particlesRendering.primitives.segments.geometry = geometry;
            var vertexArray = VertexArray.fromGeometry({ //Cesium.
                context: this.context,
                geometry: geometry,
                attributeLocations: this.particlesRendering.primitives.segments.attributeLocations,
                bufferUsage: BufferUsage.STATIC_DRAW, //Cesium.
            });
            this.particlesRendering.primitives.segments.commandToExecute.vertexArray = vertexArray;
        }
    }

    applyUserInput(userInput) {
        var maxParticlesChanged = false;
        if (this.userInput.maxParticles != userInput.maxParticles) {
            maxParticlesChanged = true;
        }

        Object.keys(userInput).forEach((key) => {
            this.userInput[key] = userInput[key];
        });
        this.refreshParticles(maxParticlesChanged);
    }

    applyViewerParameters(viewerParameters) {
        Object.keys(viewerParameters).forEach((key) => {
            this.viewerParameters[key] = viewerParameters[key];
        });
        this.refreshParticles(false);
    }
}
