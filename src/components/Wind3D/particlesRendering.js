import CustomPrimitive from './customPrimitive.js';
import Geometry from 'cesium/Source/Core/Geometry.js';
import GeometryAttribute from 'cesium/Source/Core/GeometryAttribute.js';
import GeometryAttributes from 'cesium/Source/Core/GeometryAttributes.js';
import ComponentDatatype from 'cesium/Source/Core/ComponentDatatype.js';
import PixelFormat from 'cesium/Source/Core/PixelFormat.js';
import PixelDatatype from 'cesium/Source/Renderer/PixelDatatype.js';
import PrimitiveType from 'cesium/Source/Core/PrimitiveType.js';
import Sampler from 'cesium/Source/Renderer/Sampler.js';
import ShaderSource from 'cesium/Source/Renderer/ShaderSource.js';
import TextureMinificationFilter from 'cesium/Source/Renderer/TextureMinificationFilter.js';
import TextureMagnificationFilter from 'cesium/Source/Renderer/TextureMagnificationFilter.js';
import DepthFunction from 'cesium/Source/Scene/DepthFunction.js';
import Util from './util.js';
const { fileOptions } = require('./gui.js');

export default class ParticlesRendering {
    constructor(context, data, userInput, viewerParameters, particlesComputing) {
        this.createRenderingTextures(context, data);
        this.createRenderingFramebuffers(context);
        this.createRenderingPrimitives(context, userInput, viewerParameters, particlesComputing);
    }

    createRenderingTextures(context, data) {
        const colorTextureOptions = {
            context: context,
            width: context.drawingBufferWidth,
            height: context.drawingBufferHeight,
            pixelFormat: PixelFormat.RGBA, //Cesium.
            pixelDatatype: PixelDatatype.UNSIGNED_BYTE //Cesium.
        };
        const depthTextureOptions = {
            context: context,
            width: context.drawingBufferWidth,
            height: context.drawingBufferHeight,
            pixelFormat: PixelFormat.DEPTH_COMPONENT, //Cesium.
            pixelDatatype: PixelDatatype.UNSIGNED_INT //Cesium.
        };

        this.textures = {
            segmentsColor: Util.createTexture(colorTextureOptions),
            segmentsDepth: Util.createTexture(depthTextureOptions),

            currentTrailsColor: Util.createTexture(colorTextureOptions),
            currentTrailsDepth: Util.createTexture(depthTextureOptions),

            nextTrailsColor: Util.createTexture(colorTextureOptions),
            nextTrailsDepth: Util.createTexture(depthTextureOptions),
        };
    }

    createRenderingFramebuffers(context) {
        this.framebuffers = {
            segments: Util.createFramebuffer(context, this.textures.segmentsColor, this.textures.segmentsDepth),
            currentTrails: Util.createFramebuffer(context, this.textures.currentTrailsColor, this.textures.currentTrailsDepth),
            nextTrails: Util.createFramebuffer(context, this.textures.nextTrailsColor, this.textures.nextTrailsDepth)
        }
    }

    createSegmentsGeometry(userInput) {
        const repeatVertex = 4;

        var st = [];
        for (var s = 0; s < userInput.particlesTextureSize; s++) {
            for (var t = 0; t < userInput.particlesTextureSize; t++) {
                for (var i = 0; i < repeatVertex; i++) {
                    st.push(s / userInput.particlesTextureSize);
                    st.push(t / userInput.particlesTextureSize);
                }
            }
        }
        st = new Float32Array(st);

        var normal = [];
        const pointToUse = [-1, 1];
        const offsetSign = [-1, 1];
        for (var i = 0; i < userInput.maxParticles; i++) {
            for (var j = 0; j < repeatVertex / 2; j++) {
                for (var k = 0; k < repeatVertex / 2; k++) {
                    normal.push(pointToUse[j]);
                    normal.push(offsetSign[k]);
                    normal.push(0);
                }
            }
        }
        normal = new Float32Array(normal);

        const indexSize = 6 * userInput.maxParticles;
        var vertexIndexes = new Uint32Array(indexSize);
        for (var i = 0, j = 0, vertex = 0; i < userInput.maxParticles; i++) {
            vertexIndexes[j++] = vertex + 0;
            vertexIndexes[j++] = vertex + 1;
            vertexIndexes[j++] = vertex + 2;
            vertexIndexes[j++] = vertex + 2;
            vertexIndexes[j++] = vertex + 1;
            vertexIndexes[j++] = vertex + 3;
            vertex += 4;
        }

        var geometry = new Geometry({ //Cesium.
            attributes: new GeometryAttributes({ //Cesium.
                st: new GeometryAttribute({ //Cesium.
                    componentDatatype: ComponentDatatype.FLOAT, //Cesium.
                    componentsPerAttribute: 2,
                    values: st
                }),
                normal: new GeometryAttribute({ //Cesium.
                    componentDatatype: ComponentDatatype.FLOAT, //Cesium.
                    componentsPerAttribute: 3,
                    values: normal
                }),
            }),
            indices: vertexIndexes
        });

        return geometry;
    }

    createRenderingPrimitives(context, userInput, viewerParameters, particlesComputing) {
        const that = this;
        this.primitives = {
            segments: new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    st: 0,
                    normal: 1
                },
                geometry: this.createSegmentsGeometry(userInput),
                primitiveType: PrimitiveType.TRIANGLES, //Cesium.
                uniformMap: {
                    previousParticlesPosition: function () {
                        return particlesComputing.particlesTextures.previousParticlesPosition;
                    },
                    currentParticlesPosition: function () {
                        return particlesComputing.particlesTextures.currentParticlesPosition;
                    },
                    postProcessingPosition: function () {
                        return particlesComputing.particlesTextures.postProcessingPosition;
                    },
                    aspect: function () {
                        return context.drawingBufferWidth / context.drawingBufferHeight;
                    },
                    pixelSize: function () {
                        return viewerParameters.pixelSize;
                    },
                    lineWidth: function () {
                        return userInput.lineWidth;
                    },
                    particleHeight: function () {
                        return userInput.particleHeight;
                    }
                },
                vertexShaderSource: new ShaderSource({ //Cesium.
                    sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.vert')]
                }),
                fragmentShaderSource: new ShaderSource({ //Cesium.
                    sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.frag')]
                }),
                rawRenderState: Util.createRawRenderState({
                    // undefined value means let Cesium deal with it
                    viewport: undefined,
                    depthTest: {
                        enabled: true
                    },
                    depthMask: true
                }),
                framebuffer: this.framebuffers.segments,
                autoClear: true
            }),

            trails: new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    position: 0,
                    st: 1
                },
                geometry: Util.getFullscreenQuad(),
                primitiveType: PrimitiveType.TRIANGLES, //Cesium.
                uniformMap: {
                    segmentsColorTexture: function () {
                        return that.textures.segmentsColor;
                    },
                    segmentsDepthTexture: function () {
                        return that.textures.segmentsDepth;
                    },
                    currentTrailsColor: function () {
                        return that.framebuffers.currentTrails.getColorTexture(0);
                    },
                    trailsDepthTexture: function () {
                        return that.framebuffers.currentTrails.depthTexture;
                    },
                    fadeOpacity: function () {
                        return userInput.fadeOpacity;
                    }
                },
                // prevent Cesium from writing depth because the depth here should be written manually
                vertexShaderSource: new ShaderSource({ //Cesium.
                    defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'fullscreen.vert')]
                }),
                fragmentShaderSource: new ShaderSource({ //Cesium.
                    defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'trailDraw.frag')]
                }),
                rawRenderState: Util.createRawRenderState({
                    viewport: undefined,
                    depthTest: {
                        enabled: true,
                        func: DepthFunction.ALWAYS //Cesium. // always pass depth test for full control of depth information
                    },
                    depthMask: true
                }),
                framebuffer: this.framebuffers.nextTrails,
                autoClear: true,
                preExecute: function () {
                    // swap framebuffers before binding
                    var temp;
                    temp = that.framebuffers.currentTrails;
                    that.framebuffers.currentTrails = that.framebuffers.nextTrails;
                    that.framebuffers.nextTrails = temp;

                    // keep the framebuffers up to date
                    that.primitives.trails.commandToExecute.framebuffer = that.framebuffers.nextTrails;
                    that.primitives.trails.clearCommand.framebuffer = that.framebuffers.nextTrails;
                }
            }),

            screen: new CustomPrimitive({
                commandType: 'Draw',
                attributeLocations: {
                    position: 0,
                    st: 1
                },
                geometry: Util.getFullscreenQuad(),
                primitiveType: PrimitiveType.TRIANGLES, //Cesium.
                uniformMap: {
                    trailsColorTexture: function () {
                        return that.framebuffers.nextTrails.getColorTexture(0);
                    },
                    trailsDepthTexture: function () {
                        return that.framebuffers.nextTrails.depthTexture;
                    }
                },
                // prevent Cesium from writing depth because the depth here should be written manually
                vertexShaderSource: new ShaderSource({ //Cesium.
                    defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'fullscreen.vert')]
                }),
                fragmentShaderSource: new ShaderSource({ //Cesium.
                    defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
                    sources: [Util.loadText(fileOptions.glslDirectory + 'screenDraw.frag')]
                }),
                rawRenderState: Util.createRawRenderState({
                    viewport: undefined,
                    depthTest: {
                        enabled: false
                    },
                    depthMask: true,
                    blending: {
                        enabled: true
                    }
                }),
                framebuffer: undefined // undefined value means let Cesium deal with it
            })
        };
    }
}
