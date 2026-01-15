let animationRunning = true; // 랜덤 이동을 제어하는 변수

function moveSpritesRandomly(sprites, scene) {
    animationRunning = true; // 랜덤 이동 활성화

    sprites.forEach((sprite) => {
        sprite.originalPosition = sprite.position.clone(); // 원래 위치 저장
        sprite.randomOffset = new BABYLON.Vector3(
            (Math.random() - 0.5) * 1000,  // X축 랜덤 이동
            (Math.random() - 0.5) * 1000,  // Y축 랜덤 이동
            (Math.random() - 0.5) * 1000   // Z축 랜덤 이동
        );
    });

    let time = 0;

    scene.onBeforeRenderObservable.add(() => {
        if (!animationRunning) return; // 🔥 멈추기 조건 추가!

        time += scene.getEngine().getDeltaTime() * 0.001;  // 시간 업데이트

        sprites.forEach((sprite) => {
            // 랜덤 이동 (부드럽게 움직이도록 sin 함수 활용)
            sprite.position.x = sprite.originalPosition.x + sprite.randomOffset.x * Math.sin(time);
            sprite.position.y = sprite.originalPosition.y + sprite.randomOffset.y * Math.cos(time);
            sprite.position.z = sprite.originalPosition.z + sprite.randomOffset.z * Math.sin(time * 0.5);
        });
    });

    // 5초 후 원래 위치로 복귀
    setTimeout(() => {
        restoreSprites(sprites, scene);
    }, 7000);
}

function restoreSprites(sprites, scene) {
    animationRunning = false; // 🔥 랜덤 이동 중지!
    
    sprites.forEach((sprite) => {
        let animation = new BABYLON.Animation(
            "spriteReturn",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        let keyFrames = [];
        keyFrames.push({ frame: 0, value: sprite.position.clone() });
        keyFrames.push({ frame: 60, value: sprite.originalPosition.clone() });

        animation.setKeys(keyFrames);
        sprite.animations = [animation];
        scene.beginAnimation(sprite, 0, 60, false);
    });

    console.log("🎯 한자 스프라이트 원래 위치로 복귀 중...");

    // 🔥 3초 동안 멈춘 후 다시 랜덤 이동 시작!
    setTimeout(() => {
        console.log("🔄 다시 랜덤 이동 시작!");
        moveSpritesRandomly(sprites, scene);
    }, 10000);  // 🛑 3초 동안 멈추기 (원래 위치에서 대기)
}

function createHanziSprite(scene, x, y, z) {
    let spriteManager = new BABYLON.SpriteManager("hanziManager", "https://i.imgur.com/3x0HfL7.png", 1, { width: 3000, height: 3000 }, scene);
    let hanziSprite = new BABYLON.Sprite("hanzi", spriteManager);
    hanziSprite.position = new BABYLON.Vector3(x,y,z);
    return hanziSprite;

}

var createScene = async function (engine) {
    const scene = new BABYLON.Scene(engine);

    const alpha =  3*Math.PI/2;
    const beta = Math.PI/50;
    const radius = 220;
    const target = new BABYLON.Vector3(0, 0, 0);
    
    const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, scene);
    // camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.6;

    let sprites = [];

    BABYLON.SceneLoader.ImportMesh("ply/Untitled.glb", scene, function (meshes) {          
        scene.createDefaultCameraOrLight(true, true, true);
        scene.createDefaultEnvironment();

        meshes[0].setEnabled(false);
        var pcs = new BABYLON.PointsCloudSystem("pcs", 1, scene);
        pcs.addSurfacePoints(meshes[1], 4000, BABYLON.PointColor.None, 0);


        pcs.buildMeshAsync().then(() => {
            pcs.particles.forEach((particle) => {
                const hanziSprite = createHanziSprite(scene, particle.position.x, particle.position.y, particle.position.z);  
                hanziSprite.width = 70;
                hanziSprite.height = 70;
                sprites.push(hanziSprite);
            });

            pcs.mesh.isVisible = false;  // 포인트 클라우드 숨기기
            moveSpritesRandomly(sprites, scene); // 한자 스프라이트 랜덤 이동 시작!
        });
    });

    return scene;
};