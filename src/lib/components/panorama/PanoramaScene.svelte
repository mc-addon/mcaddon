<script lang="ts">
    import { T, useTask } from "@threlte/core";
    import { CubeEnvironment } from "@threlte/extras";
    import { MathUtils, Object3D } from "three";

    let { speed }: { speed: number } = $props();

    let cameraContainer = $state<Object3D>();

    // Use Threlte's useTask for animation loop
    useTask(() => {
        if (cameraContainer) {
            cameraContainer.rotateY(speed);
        }
    });
</script>

<!-- Cube Environment (skybox) -->
<CubeEnvironment
    urls={["/scenes/right.webp", "/scenes/left.webp", "/scenes/top.webp", "/scenes/bottom.webp", "/scenes/front.webp", "/scenes/back.webp"]}
    isBackground={true}
/>

<!-- Camera container to handle rotation while ignoring tilt -->
<T.Object3D bind:ref={cameraContainer}>
    <!-- Camera with initial tilt and rotation to match Minecraft's panorama -->
    <T.PerspectiveCamera fov={90} makeDefault position={[0, 0, 0]} rotation={[MathUtils.degToRad(20), MathUtils.degToRad(-180), 0]} />
</T.Object3D>
