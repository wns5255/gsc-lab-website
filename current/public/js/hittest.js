
//바빌론 ar 화면 
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var createScene = async function () {

    // Create a Babylon Scene
    var scene = new BABYLON.Scene(engine);

    // Create and position a free camera
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -5), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Add light sources
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var dirLight = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(0, -1, -0.5), scene);
    dirLight.position = new BABYLON.Vector3(0, 5, -5);

    var shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Load the Gaussian Splatting Model
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
        null,
        "/splat/", "pooh.splat",
        scene
    );

    const gaussianSplattingMesh = result.meshes[0];
    gaussianSplattingMesh.rotationQuaternion = new BABYLON.Quaternion();
    shadowGenerator.addShadowCaster(gaussianSplattingMesh, true);

    var xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            referenceSpaceType: "local-floor"
        },
        optionalFeatures: true
    });

    const fm = xr.baseExperience.featuresManager;

    const xrTest = fm.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
    const xrPlanes = fm.enableFeature(BABYLON.WebXRPlaneDetector.Name, "latest");
    const anchors = fm.enableFeature(BABYLON.WebXRAnchorSystem.Name, 'latest');

    const xrBackgroundRemover = fm.enableFeature(BABYLON.WebXRBackgroundRemover.Name);

    const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.05 });
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();

    let hitTest;

    gaussianSplattingMesh.isVisible = false;

    xrTest.onHitTestResultObservable.add((results) => {
        if (results.length) {
            marker.isVisible = true;
            hitTest = results[0];
            hitTest.transformationMatrix.decompose(
                undefined,
                gaussianSplattingMesh.rotationQuaternion,
                gaussianSplattingMesh.position
            );
            hitTest.transformationMatrix.decompose(
                undefined,
                marker.rotationQuaternion,
                marker.position
            );
        } else {
            marker.isVisible = false;
            hitTest = undefined;
        }
    });

    if (anchors) {
        anchors.onAnchorAddedObservable.add(anchor => {
            gaussianSplattingMesh.isVisible = true;
            anchor.attachedNode = gaussianSplattingMesh.clone("gaussian_clone");
            shadowGenerator.addShadowCaster(anchor.attachedNode, true);
            gaussianSplattingMesh.isVisible = false;
        });

        anchors.onAnchorRemovedObservable.add(anchor => {
            if (anchor) {
                anchor.attachedNode.isVisible = false;
                anchor.attachedNode.dispose();
            }
        });
    }

    scene.onPointerDown = (evt, pickInfo) => {
        if (hitTest && anchors && xr.baseExperience.state === BABYLON.WebXRState.IN_XR) {
            anchors.addAnchorPointUsingHitTestResultAsync(hitTest);
        }
    };

    const planes = [];

    xrPlanes.onPlaneAddedObservable.add(plane => {
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        const polygon_triangulation = new BABYLON.PolygonMeshBuilder(
            "name",
            plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)),
            scene
        );
        const polygon = polygon_triangulation.build(false, 0.01);
        plane.mesh = polygon;
        planes[plane.id] = plane.mesh;

        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.alpha = 0.5;
        mat.diffuseColor = BABYLON.Color3.Random();
        polygon.createNormals();
        plane.mesh.material = mat;

        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(
            plane.mesh.scaling,
            plane.mesh.rotationQuaternion,
            plane.mesh.position
        );
    });

    xrPlanes.onPlaneUpdatedObservable.add(plane => {
        let mat;
        if (plane.mesh) {
            mat = plane.mesh.material;
            plane.mesh.dispose(false, false);
        }
        const some = plane.polygonDefinition.some(p => !p);
        if (some) {
            return;
        }
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        const polygon_triangulation = new BABYLON.PolygonMeshBuilder(
            "name",
            plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)),
            scene
        );
        const polygon = polygon_triangulation.build(false, 0.01);
        polygon.createNormals();
        plane.mesh = polygon;
        planes[plane.id] = plane.mesh;
        plane.mesh.material = mat;
        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(
            plane.mesh.scaling,
            plane.mesh.rotationQuaternion,
            plane.mesh.position
        );
    });

    xrPlanes.onPlaneRemovedObservable.add(plane => {
        if (plane && planes[plane.id]) {
            planes[plane.id].dispose();
        }
    });

    xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        planes.forEach(plane => plane.dispose());
        while (planes.pop()) { };
    });

    return scene;
};


const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.then(function (scene) {
        scene.render();
    });
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});