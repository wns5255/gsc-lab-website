//바빌론 ar 화면 

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var createScene = async function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.ArcRotateCamera("camera1", -1,1,10,new BABYLON.Vector3(0, 0, 0), scene);

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Gaussian Splatting
    var gs = new BABYLON.GaussianSplattingMesh("Halo", null, scene);
    gs.loadFileAsync("https://raw.githubusercontent.com/ParkAyeon/GS-Quest3/main/gyeonbok.splat").then(()=>{
        gs.position.y = 1.7;
    });

    const xr = await scene.createDefaultXRExperienceAsync({
    // ask for an ar-session
        uiOptions: {
        sessionMode: "immersive-ar",
        },
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