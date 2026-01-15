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

let userPosition = { lat: 37.571, lng: 126.976 }; // 기본 위치 (초기값)

// 거리 계산 함수
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

    return R * c; // 거리 (미터 단위)
}

// 사용자 위치 추적 (GPS)
navigator.geolocation.watchPosition(
    (position) => {
        userPosition.lat = position.coords.latitude;
        userPosition.lng = position.coords.longitude;
        updateGoogleMaps(userPosition); // 구글맵 업데이트
    },
    (error) => console.error("GPS Error:", error),
    { enableHighAccuracy: true }
);

// Google Maps iframe 업데이트 함수
function updateGoogleMaps(position) {
    const iframe = document.getElementById("googleMap");
    if (iframe) {
        const url = `https://maps.google.com/maps?q=${position.lat},${position.lng}&z=15&output=embed`;
        iframe.src = url;
    }
}

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

    // 사용자 근접성 확인
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

        // Splat Mesh 표시
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

// HTML로 Google Maps 추가
const googleMapDiv = document.createElement("div");
googleMapDiv.id = "googleMapContainer";
googleMapDiv.style.position = "absolute";
googleMapDiv.style.top = "10px";
googleMapDiv.style.right = "10px";
googleMapDiv.style.width = "300px";
googleMapDiv.style.height = "200px";
googleMapDiv.style.border = "2px solid black";
googleMapDiv.style.zIndex = "10";
googleMapDiv.style.backgroundColor = "white";

const googleMapIframe = document.createElement("iframe");
googleMapIframe.id = "googleMap";
googleMapIframe.style.width = "100%";
googleMapIframe.style.height = "100%";
googleMapIframe.style.border = "none";

googleMapDiv.appendChild(googleMapIframe);
document.body.appendChild(googleMapDiv);

// Scene 생성 및 렌더링 루프
const scene = createScene();
engine.runRenderLoop(() => {
    scene.then(s => s.render());
});

// 창 크기 조정 시 엔진 크기 조정
window.addEventListener("resize", () => {
    engine.resize();
});
