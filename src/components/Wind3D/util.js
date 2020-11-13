import Geometry from 'cesium/Source/Core/Geometry.js';
import GeometryAttribute from 'cesium/Source/Core/GeometryAttribute.js';
import GeometryAttributes from 'cesium/Source/Core/GeometryAttributes.js';
import ComponentDatatype from 'cesium/Source/Core/ComponentDatatype.js';
import defined from 'cesium/Source/Core/defined.js';
import CesiumMath from 'cesium/Source/Core/Math.js';
import Texture from 'cesium/Source/Renderer/Texture.js';
import Framebuffer from 'cesium/Source/Renderer/Framebuffer.js';
import Appearance from 'cesium/Source/Scene/Appearance.js';

const Util = (function () {
	var loadText = function (filePath) {
		var request = new XMLHttpRequest();
		request.open('GET', filePath, false);
		request.send();
		return request.responseText;
	}

	var getFullscreenQuad = function () {
		var fullscreenQuad = new Geometry({ //Cesium.
			attributes: new GeometryAttributes({ //Cesium.
				position: new GeometryAttribute({ //Cesium.
					componentDatatype: ComponentDatatype.FLOAT, //Cesium.
					componentsPerAttribute: 3,
					//  v3----v2
					//  |     |
					//  |     |
					//  v0----v1
					values: new Float32Array([
						-1, -1, 0, // v0
						1, -1, 0, // v1
						1, 1, 0, // v2
						-1, 1, 0, // v3
					])
				}),
				st: new GeometryAttribute({ //Cesium.
					componentDatatype: ComponentDatatype.FLOAT, //Cesium.
					componentsPerAttribute: 2,
					values: new Float32Array([
						0, 0,
						1, 0,
						1, 1,
						0, 1,
					])
				})
			}),
			indices: new Uint32Array([3, 2, 0, 0, 2, 1])
		});
		return fullscreenQuad;
	}

	var createTexture = function (options, typedArray) {
		if (defined(typedArray)) { //Cesium.
			// typed array needs to be passed as source option, this is required by Cesium.Texture
			var source = {};
			source.arrayBufferView = typedArray;
			options.source = source;
		}

		var texture = new Texture(options); //Cesium.
		return texture;
	}

	var createFramebuffer = function (context, colorTexture, depthTexture) {
		var framebuffer = new Framebuffer({ //Cesium.
			context: context,
			colorTextures: [colorTexture],
			depthTexture: depthTexture
		});
		return framebuffer;
	}

	var createRawRenderState = function (options) {
		var translucent = true;
		var closed = false;
		var existing = {
			viewport: options.viewport,
			depthTest: options.depthTest,
			depthMask: options.depthMask,
			blending: options.blending
		};

		var rawRenderState = Appearance.getDefaultRenderState(translucent, closed, existing); //Cesium.
		return rawRenderState;
	}

	var viewRectangleToLonLatRange = function (viewRectangle) {
		var range = {};

		var postiveWest = CesiumMath.mod(viewRectangle.west, CesiumMath.TWO_PI); //Cesium.
		var postiveEast = CesiumMath.mod(viewRectangle.east, CesiumMath.TWO_PI); //Cesium.
		var width = viewRectangle.width;

		var longitudeMin;
		var longitudeMax;
		if (width > CesiumMath.THREE_PI_OVER_TWO) { //Cesium.
			longitudeMin = 0.0;
			longitudeMax = CesiumMath.TWO_PI; //Cesium.
		} else {
			if (postiveEast - postiveWest < width) {
				longitudeMin = postiveWest;
				longitudeMax = postiveWest + width;
			} else {
				longitudeMin = postiveWest;
				longitudeMax = postiveEast;
			}
		}

		range.lon = {
			min: CesiumMath.toDegrees(longitudeMin), //Cesium.
			max: CesiumMath.toDegrees(longitudeMax)  //Cesium.
		}

		var south = viewRectangle.south;
		var north = viewRectangle.north;
		var height = viewRectangle.height;

		var extendHeight = height > CesiumMath.PI / 12 ? height / 2 : 0; //Cesium.
		var extendedSouth = CesiumMath.clampToLatitudeRange(south - extendHeight); //Cesium.
		var extendedNorth = CesiumMath.clampToLatitudeRange(north + extendHeight); //Cesium.

		// extend the bound in high latitude area to make sure it can cover all the visible area
		if (extendedSouth < -CesiumMath.PI_OVER_THREE) { //Cesium.
			extendedSouth = -CesiumMath.PI_OVER_TWO; //Cesium.
		}
		if (extendedNorth > CesiumMath.PI_OVER_THREE) { //Cesium.
			extendedNorth = CesiumMath.PI_OVER_TWO; //Cesium.
		}

		range.lat = {
			min: CesiumMath.toDegrees(extendedSouth), //Cesium.
			max: CesiumMath.toDegrees(extendedNorth)  //Cesium.
		}

		return range;
	}

	return {
		loadText: loadText,
		getFullscreenQuad: getFullscreenQuad,
		createTexture: createTexture,
		createFramebuffer: createFramebuffer,
		createRawRenderState: createRawRenderState,
		viewRectangleToLonLatRange: viewRectangleToLonLatRange
	};
})();
export default Util;
