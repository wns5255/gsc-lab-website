const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const blueLineCoordinates = [
    { lat: 37.494720, lng: 126.960804 }, // 시작 지점
    { lat: 37.494724, lng: 126.959844 }, // 중간 지점
    { lat: 37.495035, lng: 126.958586 },
    // 추가 경로 좌표
];


let lastPlanePosition = null;
let userGPSPosition = null;
const moveThreshold = 2; // 이동 거리 임계값 (2미터)
const gaussianScaleFactor = 0.5; // Gaussian Splatting 크기 조정

// 사용자 GPS 위치 업데이트 함수
function updateUserGPSPosition() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userGPSPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            },
            (error) => {
                console.error("Error getting GPS location:", error);
            },
            {
                enableHighAccuracy: true
            }
        );
    } else {
        console.error("Geolocation API not supported in this browser.");
    }
}

// 2초 간격으로 GPS 위치 업데이트
setInterval(updateUserGPSPosition, 2000);

// 파란선 근처인지 확인하는 함수
const isNearBlueLine = (userPosition, blueLineCoordinates) => {
    return blueLineCoordinates.some(coord => {
        const dx = coord.lat - userPosition.lat;
        const dz = coord.lng - userPosition.lng;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < 0.00002; // 약 2미터
    });
};

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -5), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const dirLight = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(0, -1, -0.5), scene);
    dirLight.position = new BABYLON.Vector3(0, 5, -5);

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Load Gaussian Splatting Model
    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "/splat/", "hci_wall_f.splat", scene);
    const gaussianSplattingMesh = result.meshes[0];
    gaussianSplattingMesh.rotationQuaternion = new BABYLON.Quaternion();
    gaussianSplattingMesh.isVisible = false; // 기본적으로 보이지 않음
    gaussianSplattingMesh.scaling.scaleInPlace(gaussianScaleFactor);

    // Gaussian Mesh Bound 계산
    const gaussianBoundingInfo = gaussianSplattingMesh.getBoundingInfo();
    const gaussianWidth = (gaussianBoundingInfo.boundingBox.maximum.x - gaussianBoundingInfo.boundingBox.minimum.x) * gaussianScaleFactor;
    const gaussianHeight = (gaussianBoundingInfo.boundingBox.maximum.z - gaussianBoundingInfo.boundingBox.minimum.z) * gaussianScaleFactor;

    // XR Experience
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: "immersive-ar", referenceSpaceType: "local-floor" },
        optionalFeatures: true
    });

    const fm = xr.baseExperience.featuresManager;

    const xrPlanes = fm.enableFeature(BABYLON.WebXRPlaneDetector.Name, "latest");

    // Plane 생성 함수
    const createPlane = (position, width, height, scene) => {
        const plane = BABYLON.MeshBuilder.CreatePlane("groundPlane", { width, height }, scene);

        const mat = new BABYLON.StandardMaterial("planeMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1); // 파란색
        mat.alpha = 0; // 반투명
        plane.material = mat;

        plane.position = position;
        plane.rotation.x = Math.PI / 2; // 바닥에 평평하게
        return plane;
    };

    xrPlanes.onPlaneAddedObservable.add((xrPlane) => {
        if (!userGPSPosition) {
            console.warn("GPS location not available.");
            return;
        }

        // 현재 위치가 파란선 근처인지 확인
        if (!isNearBlueLine(userGPSPosition, blueLineCoordinates)) {
            console.warn("User is not near the blue line.");
            return;
        }

        // 사용자의 위치 벡터 생성
        const userPositionVector = new BABYLON.Vector3(
            userGPSPosition.lat - 37.57, // 임의 기준 좌표로 변환
            0,
            userGPSPosition.lng - 126.97
        );

        // 이전 plane과의 거리 확인
        if (
            lastPlanePosition &&
            BABYLON.Vector3.Distance(lastPlanePosition, userPositionVector) < moveThreshold
        ) {
            console.warn("User has not moved far enough to generate a new plane.");
            return;
        }

        // 새로운 plane 생성
        lastPlanePosition = userPositionVector.clone();
        const plane = createPlane(lastPlanePosition, gaussianWidth, gaussianHeight, scene);

        // Gaussian Splatting Mesh 생성 및 배치
        const gaussianMesh = gaussianSplattingMesh.clone("gaussian_clone");
        gaussianMesh.isVisible = true;
        gaussianMesh.position = plane.position.clone();
        gaussianMesh.position.y += 0.01; // Plane 위로 약간 띄워 배치
        gaussianMesh.scaling.scaleInPlace(gaussianScaleFactor);
    });

    return scene;
};

const scene = createScene();
engine.runRenderLoop(() => {
    scene.then(scene => scene.render());
});

window.addEventListener("resize", () => {
    engine.resize();
});