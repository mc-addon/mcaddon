<script lang="ts">
    import { Canvas } from "@threlte/core";
    import PanoramaScene from "./PanoramaScene.svelte";

    interface Props {
        speed?: number;
    }

    let { speed = -0.0005 }: Props = $props();
</script>

<div class="absolute -z-100 block size-full bg-[url('/scenes/fallback.webp')] bg-cover">
    <Canvas>
        <PanoramaScene {speed} />
    </Canvas>
</div>
