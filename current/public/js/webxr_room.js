import {WebXRButton} from './js/util/webxr-button.js';
import {Scene} from './js/render/scenes/scene.js';
import {Renderer, createWebGLContext} from './js/render/core/renderer.js';
import {Gltf2Node} from './js/render/nodes/gltf2.js';
import {SkyboxNode} from './js/render/nodes/skybox.js';
import {BoundsRenderer} from './js/render/nodes/bounds-renderer.js';
import {InlineViewerHelper} from './js/util/inline-viewer-helper.js';
import {QueryArgs} from './js/util/query-args.js';

// If requested, use the polyfill to provide support for mobile devices
// and devices which only support WebVR.
import WebXRPolyfill from './js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
if (QueryArgs.getBool('usePolyfill', true)) {
let polyfill = new WebXRPolyfill();
}

// XR globals.
let xrButton = null;
let xrImmersiveRefSpace = null;
let inlineViewerHelper = null;

// WebGL scene globals.
let gl = null;
let renderer = null;
let scene = new Scene();
scene.addNode(new Gltf2Node({url: 'media/gltf/camp/camp.gltf'}));
scene.addNode(new SkyboxNode({url: 'media/textures/eilenriede-park-2k.png'}));
scene.standingStats(true);

let boundsRenderer = null;

function initXR() {
xrButton = new WebXRButton({
    onRequestSession: onRequestSession,
    onEndSession: onEndSession
});
document.querySelector('header').appendChild(xrButton.domElement);

if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
    xrButton.enabled = supported;
    });

    navigator.xr.requestSession('inline').then(onSessionStarted);
}
}

function onRequestSession() {
return navigator.xr.requestSession('immersive-vr', {
    // Our standing experience will require at least a local-floor
    // reference space (which will be available even on 3DoF device)
    // but can optionally make use of bounded-floor reference spaces
    // when available.
    requiredFeatures: ['local-floor'],
    optionalFeatures: ['bounded-floor']
}).then((session) => {
    xrButton.setSession(session);
    session.isImmersive = true;
    onSessionStarted(session);
});
}

function initGL() {
if (gl)
    return;

gl = createWebGLContext({
    xrCompatible: true
});
document.body.appendChild(gl.canvas);

function onResize() {
    gl.canvas.width = gl.canvas.clientWidth * window.devicePixelRatio;
    gl.canvas.height = gl.canvas.clientHeight * window.devicePixelRatio;
}
window.addEventListener('resize', onResize);
onResize();

renderer = new Renderer(gl);

scene.setRenderer(renderer);
}

function onSessionStarted(session) {
session.addEventListener('end', onSessionEnded);

initGL();

let glLayer = new XRWebGLLayer(session, gl);
session.updateRenderState({ baseLayer: glLayer });

function onRefSpaceCreated(refSpace) {
    if (session.isImmersive) {
    xrImmersiveRefSpace = refSpace;
    } else {
    // If we're using a viewer reference space we need to scoot the
    // origin down a bit to put the camera at approximately the right
    // level. (Here we're moving it 1.6 meters, which is *very* roughly
    // the eye height of an "average" adult human.)
    inlineViewerHelper = new InlineViewerHelper(gl.canvas, refSpace);
    inlineViewerHelper.setHeight(1.6);

    // You can accomplish the same thing without the helper class by
    // simply offseting the reference space with a negative y value:
    // refSpace = refSpace.getOffsetReferenceSpace(new XRRigidTransform({y: -1.6}));
    }
    session.requestAnimationFrame(onXRFrame);
}

if (session.isImmersive) {
    // Attempt to get a 'bounded-floor' reference space, which will align
    // the user's physical floor with Y=0 and provide boundaries that
    // indicate where the user can safely walk.
    session.requestReferenceSpace('bounded-floor').then((refSpace) => {
    onRefSpaceCreated(refSpace);

    if (!boundsRenderer) {
        boundsRenderer = new BoundsRenderer(refSpace);
        scene.addNode(boundsRenderer);
    } else {
        boundsRenderer.boundedRefSpace = refSpace;
    }

    refSpace.onreset = (evt) => {
        boundsRenderer.boundedRefSpace = evt.referenceSpace;
    }
    }).catch(() => {
    // If a bounded reference space isn't supported, fall back to a
    // local-floor reference space. This still provides a floor-relative
    // space and will always be supported for immersive sessions. It
    // will not, however, provide boundaries and generally expects the
    // user to stand in one place. If the device doesn't have a way of
    // determining the floor level (for example, with a 3DoF device)
    // then it will return an emulated local-floor space, where the view
    // is translated up by a static height so that the scene still
    // renders in approximately the right place.
    console.log('Falling back to local-floor reference space');
    session.requestReferenceSpace('local-floor').then(onRefSpaceCreated);
    });
} else {
    session.requestReferenceSpace('viewer').then(onRefSpaceCreated);
}
}

function onEndSession(session) {
session.end();
}

function onSessionEnded(event) {
if (event.session.isImmersive) {
    xrButton.setSession(null);
}
}

function onXRFrame(t, frame) {
let session = frame.session;
let refSpace = session.isImmersive ?
                    xrImmersiveRefSpace :
                    inlineViewerHelper.referenceSpace;
let pose = frame.getViewerPose(refSpace);

scene.startFrame();

session.requestAnimationFrame(onXRFrame);

// Every XR frame uses basically the same render loop, so for the sake
// of keeping the sample code focused on the interesting bits most
// samples after this one will start using this helper function to hide
// away the majority of the rendering logic.
scene.drawXRFrame(frame, pose);

scene.endFrame();
}

// Start the XR application.
initXR();