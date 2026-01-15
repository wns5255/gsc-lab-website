const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const proximityThreshold = 10; // 근접 거리 (미터 단위)

// 파란 선 경로 데이터
const blueLineCoordinates = [
    { lat: 37.494714, lng: 126.960804 }, // 시작 지점
    { lat: 37.494724, lng: 126.959844 }, // 중간 지점
    { lat: 37.495035, lng: 126.958586 },
    // 추가 경로 좌표
];

let userPosition = { lat: 0, lng: 0 }; // 사용자의 현재 위치

// 거리 계산 함수 (Haversine 공식)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // 지구 반경 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 두 좌표 간 거리 (미터 단위)
}

// 사용자 위치 추적 (GPS)
navigator.geolocation.watchPosition(
    (position) => {
        userPosition.lat = position.coords.latitude;
        userPosition.lng = position.coords.longitude;
    },
    (error) => console.error("GPS Error:", error),
    { enableHighAccuracy: true }
);

const createScene = async function () {
    // Scene 생성
    const scene = new BABYLON.Scene(engine);

    // 카메라와 조명 설정
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -5), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(0, -1, -0.5), scene);
    dirLight.position = new BABYLON.Vector3(0, 5, -5);

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Gaussian Splatting 파일 로드
    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "/splat/", "hci_wall_f.splat", scene);
    const splatMesh = result.meshes[0];
    splatMesh.isVisible = false;

    // AR 환경 설정
    const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-ar",
            referenceSpaceType: "local-floor"
        },
        optionalFeatures: true
    });

    const fm = xr.baseExperience.featuresManager;
    const xrTest = fm.enableFeature(BABYLON.WebXRHitTest.Name, "latest");
    const anchors = fm.enableFeature(BABYLON.WebXRAnchorSystem.Name, 'latest');

    // 파란 선 생성 (가시화는 선택적)
    const blueLine = BABYLON.MeshBuilder.CreateLines("blueLine", {
        points: blueLineCoordinates.map(coord =>
            new BABYLON.Vector3(coord.lat - 37.4, 0, coord.lng - 126.9) // 좌표를 3D 위치로 변환
        ),
    }, scene);
    blueLine.color = new BABYLON.Color3(0, 0, 1); // 파란색 선

    // 사용자가 파란 선 근처에 있는지 확인
    scene.onBeforeRenderObservable.add(() => {
        let isNearBlueLine = false;

        for (let i = 0; i < blueLineCoordinates.length; i++) {
            const point = blueLineCoordinates[i];
            const distance = calculateDistance(
                userPosition.lat,
                userPosition.lng,
                point.lat,
                point.lng
            );

            if (distance < proximityThreshold) {
                isNearBlueLine = true;
                break;
            }
        }

        // 사용자가 경로 근처에 있다면 Splat Mesh 표시
        if (isNearBlueLine) {
            splatMesh.isVisible = true;
            splatMesh.position = new BABYLON.Vector3(
                userPosition.lat - 37.57,
                0, // 바닥 위
                userPosition.lng - 126.97
            );
        } else {
            splatMesh.isVisible = false;
        }
    });

    return scene;
};

// Scene 생성 및 렌더링 루프
const scene = createScene();
engine.runRenderLoop(() => {
    scene.then(s => s.render());
});

// 창 크기 조정 시 엔진 크기 조정
window.addEventListener("resize", () => {
    engine.resize();
});
