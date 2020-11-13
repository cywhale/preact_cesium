import Color from 'cesium/Source/Core/Color.js';
import defined from 'cesium/Source/Core/defined.js';
import destroyObject from 'cesium/Source/Core/destroyObject.js';
import Matrix4 from 'cesium/Source/Core/Matrix4.js';
import defaultValue from 'cesium/Source/Core/defaultValue.js';
import ClearCommand from 'cesium/Source/Renderer/ClearCommand.js';
import Pass from 'cesium/Source/Renderer/Pass.js';
import VertexArray from 'cesium/Source/Renderer/VertexArray.js';
import BufferUsage from 'cesium/Source/Renderer/BufferUsage.js';
import ShaderProgram from 'cesium/Source/Renderer/ShaderProgram.js';
import RenderState from 'cesium/Source/Renderer/RenderState.js';
import DrawCommand from 'cesium/Source/Renderer/DrawCommand.js';
import ComputeCommand from 'cesium/Source/Renderer/ComputeCommand.js';

export default class CustomPrimitive {
    constructor(options) {
        this.commandType = options.commandType;

        this.geometry = options.geometry;
        this.attributeLocations = options.attributeLocations;
        this.primitiveType = options.primitiveType;

        this.uniformMap = options.uniformMap;

        this.vertexShaderSource = options.vertexShaderSource;
        this.fragmentShaderSource = options.fragmentShaderSource;

        this.rawRenderState = options.rawRenderState;
        this.framebuffer = options.framebuffer;

        this.outputTexture = options.outputTexture;

        this.autoClear = defaultValue(options.autoClear, false); //Cesium.
        this.preExecute = options.preExecute;

        this.show = true;
        this.commandToExecute = undefined;
        this.clearCommand = undefined;
        if (this.autoClear) {
            this.clearCommand = new ClearCommand({ //Cesium.
                color: new Color(0.0, 0.0, 0.0, 0.0), //Cesium.
                depth: 1.0,
                framebuffer: this.framebuffer,
                pass: Pass.OPAQUE //Cesium.
            });
        }
    }

    createCommand(context) {
        switch (this.commandType) {
            case 'Draw': {
                var vertexArray = VertexArray.fromGeometry({ //Cesium.
                    context: context,
                    geometry: this.geometry,
                    attributeLocations: this.attributeLocations,
                    bufferUsage: BufferUsage.STATIC_DRAW, //Cesium.
                });

                var shaderProgram = ShaderProgram.fromCache({ //Cesium.
                    context: context,
                    attributeLocations: this.attributeLocations,
                    vertexShaderSource: this.vertexShaderSource,
                    fragmentShaderSource: this.fragmentShaderSource
                });

                var renderState = RenderState.fromCache(this.rawRenderState); //Cesium.
                return new DrawCommand({ //Cesium.
                    owner: this,
                    vertexArray: vertexArray,
                    primitiveType: this.primitiveType,
                    uniformMap: this.uniformMap,
                    modelMatrix: Matrix4.IDENTITY, //Cesium.
                    shaderProgram: shaderProgram,
                    framebuffer: this.framebuffer,
                    renderState: renderState,
                    pass: Pass.OPAQUE //Cesium.
                });
            }
            case 'Compute': {
                return new ComputeCommand({ //Cesium.
                    owner: this,
                    fragmentShaderSource: this.fragmentShaderSource,
                    uniformMap: this.uniformMap,
                    outputTexture: this.outputTexture,
                    persists: true
                });
            }
        }
    }

    setGeometry(context, geometry) {
        this.geometry = geometry;
        var vertexArray = VertexArray.fromGeometry({ //Cesium.
            context: context,
            geometry: this.geometry,
            attributeLocations: this.attributeLocations,
            bufferUsage: BufferUsage.STATIC_DRAW, //Cesium.
        });
        this.commandToExecute.vertexArray = vertexArray;
    }

    update(frameState) {
        if (!this.show) {
            return;
        }

        if (!defined(this.commandToExecute)) { //Cesium.
            this.commandToExecute = this.createCommand(frameState.context);
        }

        if (defined(this.preExecute)) { //Cesium.
            this.preExecute();
        }

        if (defined(this.clearCommand)) { //Cesium.
            frameState.commandList.push(this.clearCommand);
        }
        frameState.commandList.push(this.commandToExecute);
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        if (defined(this.commandToExecute)) { //Cesium.
            this.commandToExecute.shaderProgram = this.commandToExecute.shaderProgram && this.commandToExecute.shaderProgram.destroy();
        }
        return destroyObject(this); //Cesium.
    }
}
