import CustomPrimitive from './customPrimitive.js';
import Cartesian2 from 'cesium/Source/Core/Cartesian2.js';
import Cartesian3 from 'cesium/Source/Core/Cartesian3.js';
import PixelFormat from 'cesium/Source/Core/PixelFormat.js';
import PixelDatatype from 'cesium/Source/Renderer/PixelDatatype.js';
import Sampler from 'cesium/Source/Renderer/Sampler.js';
import ShaderSource from 'cesium/Source/Renderer/ShaderSource.js';
import TextureMinificationFilter from 'cesium/Source/Renderer/TextureMinificationFilter.js';
import TextureMagnificationFilter from 'cesium/Source/Renderer/TextureMagnificationFilter.js';
import Util from './util.js';
const { fileOptions } = require('./gui.js');
import DataProcess from './dataProcess.js';

export default class ParticlesComputing {
    constructor(context, data, userInput, viewerParameters) {
        this.createWindTextures(context, data);
        this.createParticlesTextures(context, userInput, viewerParameters);
        this.createComputingPrimitives(data, userInput, viewerParameters);
    }

    createWindTextures(context, data) {
        var windTextureOptions = {
            context: context,
            width: data.dimensions.lon,
            height: data.dimensions.lat * data.dimensions.lev,
            pixelFormat: PixelFormat.LUMINANCE, //Cesium.
            pixelDatatype: PixelDatatype.FLOAT, //Cesium.
            flipY: false,
            sampler: new Sampler({ //Cesium.
                // the values of texture will not be interpolated
                minificationFilter: TextureMinificationFilter.NEAREST, //Cesium
                magnificationFilter: TextureMagnificationFilter.NEAREST //Cesium
            })
        };

        this.windTextures = {
            U: Util.createTexture(windTextureOptions, data.U.array),
            V: Util.createTexture(windTextureOptions, data.V.array)
        };
    }

    createParticlesTextures(context, userInput, viewerParameters) {
        var particlesTextureOptions = {
            context: context,
            width: userInput.particlesTextureSize,
            height: userInput.particlesTextureSize,
            pixelFormat: PixelFormat.RGBA, //Cesium.
            pixelDatatype: PixelDatatype.FLOAT, //Cesium.
            flipY: false,
            sampler: new Sampler({ //Cesium.
                // the values of texture will not be interpolated
                minificationFilter: TextureMinificationFilter.NEAREST,  //Cesium
                magnificationFilter: TextureMagnificationFilter.NEAREST //Cesium
            })
        };

        var particlesArray = DataProcess.randomizeParticles(userInput.maxParticles, viewerParameters)
        var zeroArray = new Float32Array(4 * userInput.maxParticles).fill(0);

        this.particlesTextures = {
            previousParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            currentParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            nextParticlesPosition: Util.createTexture(particlesTextureOptions, particlesArray),
            postProcessingPosition: Util.createTexture(particlesTextureOptions, particlesArray),

            particlesSpeed: Util.createTexture(particlesTextureOptions, zeroArray)
        };
    }

    destroyParticlesTextures() {
        Object.keys(this.particlesTextures).forEach((key) => {
            this.particlesTextures[key].destroy();
        });
    }

    createComputingPrimitives(data, userInput, viewerParameters) {
        const dimension = new Cartesian3(data.dimensions.lon, data.dimensions.lat, data.dimensions.lev); //Cesium.
        const minimum = new Cartesian3(data.lon.min, data.lat.min, data.lev.min); //Cesium.
        const maximum = new Cartesian3(data.lon.max, data.lat.max, data.lev.max); //Cesium.
        const interval = new Cartesian3( //Cesium.
            (maximum.x - minimum.x) / (dimension.x - 1),
            (maximum.y - minimum.y) / (dimension.y - 1),
            dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
        );
        const uSpeedRange = new Cartesian2(data.U.min, data.U.max); //Cesium.
        const vSpeedRange = new Cartesian2(data.V.min, data.V.max); //Cesium.

        const that = this;

        this.primitives = {
            calculateSpeed: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    U: function () {
                        return that.windTextures.U;
                    },
                    V: function () {
                        return that.windTextures.V;
                    },
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    dimension: function () {
                        return dimension;
                    },
                    minimum: function () {
                        return minimum;
                    },
                    maximum: function () {
                        return maximum;
                    },
                    interval: function () {
                        return interval;
                    },
                    uSpeedRange: function () {
                        return uSpeedRange;
                    },
                    vSpeedRange: function () {
                        return vSpeedRange;
                    },
                    pixelSize: function () {
                        return viewerParameters.pixelSize;
                    },
                    speedFactor: function () {
                        return userInput.speedFactor;
                    }
                },
                fragmentShaderSource: new ShaderSource({ //Cesium.
                    sources: [Util.loadText(fileOptions.glslDirectory + 'calculateSpeed.frag')]
                }),
                outputTexture: this.particlesTextures.particlesSpeed,
                preExecute: function () {
                    // swap textures before binding
                    var temp;
                    temp = that.particlesTextures.previousParticlesPosition;
                    that.particlesTextures.previousParticlesPosition = that.particlesTextures.currentParticlesPosition;
                    that.particlesTextures.currentParticlesPosition = that.particlesTextures.postProcessingPosition;
                    that.particlesTextures.postProcessingPosition = temp;

                    // keep the outputTexture up to date
                    that.primitives.calculateSpeed.commandToExecute.outputTexture = that.particlesTextures.particlesSpeed;
                }
            }),

            updatePosition: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    currentParticlesPosition: function () {
                        return that.particlesTextures.currentParticlesPosition;
                    },
                    particlesSpeed: function () {
                        return that.particlesTextures.particlesSpeed;
                    }
                },
                fragmentShaderSource: new ShaderSource({ //Cesium.
                    sources: [Util.loadText(fileOptions.glslDirectory + 'updatePosition.frag')]
                }),
                outputTexture: this.particlesTextures.nextParticlesPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.updatePosition.commandToExecute.outputTexture = that.particlesTextures.nextParticlesPosition;
                }
            }),

            postProcessingPosition: new CustomPrimitive({
                commandType: 'Compute',
                uniformMap: {
                    nextParticlesPosition: function () {
                        return that.particlesTextures.nextParticlesPosition;
                    },
                    particlesSpeed: function () {
                        return that.particlesTextures.particlesSpeed;
                    },
                    lonRange: function () {
                        return viewerParameters.lonRange;
                    },
                    latRange: function () {
                        return viewerParameters.latRange;
                    },
                    randomCoefficient: function () {
                        var randomCoefficient = Math.random();
                        return randomCoefficient;
                    },
                    dropRate: function () {
                        return userInput.dropRate;
                    },
                    dropRateBump: function () {
                        return userInput.dropRateBump;
                    }
                },
                fragmentShaderSource: new ShaderSource({ //Cesium.
                    sources: [Util.loadText(fileOptions.glslDirectory + 'postProcessingPosition.frag')]
                }),
                outputTexture: this.particlesTextures.postProcessingPosition,
                preExecute: function () {
                    // keep the outputTexture up to date
                    that.primitives.postProcessingPosition.commandToExecute.outputTexture = that.particlesTextures.postProcessingPosition;
                }
            })
        }
    }

}

