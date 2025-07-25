<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        src: string;
        alt?: string;
        class?: string;
        width?: number;
        height?: number;
        pixelSize?: number;
    }

    let { src = $bindable(""), alt = $bindable(""), class: className = "", width = 64, height = 64, pixelSize = 4, ...restProps }: Props = $props();

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let img: HTMLImageElement;

    function pixelateImage() {
        if (!canvas || !ctx || !img) return;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Disable image smoothing for pixelated effect
        ctx.imageSmoothingEnabled = false;
        (ctx as any).mozImageSmoothingEnabled = false;
        (ctx as any).webkitImageSmoothingEnabled = false;
        (ctx as any).msImageSmoothingEnabled = false;

        // Calculate downscaled dimensions
        const downscaleWidth = Math.floor(width / pixelSize);
        const downscaleHeight = Math.floor(height / pixelSize);

        // First, draw the image small to create pixelation
        ctx.drawImage(img, 0, 0, downscaleWidth, downscaleHeight);

        // Then scale it back up with nearest neighbor interpolation
        const imageData = ctx.getImageData(0, 0, downscaleWidth, downscaleHeight);

        // Clear canvas and draw pixelated version
        ctx.clearRect(0, 0, width, height);

        // Draw each pixel as a larger square
        for (let y = 0; y < downscaleHeight; y++) {
            for (let x = 0; x < downscaleWidth; x++) {
                const index = (y * downscaleWidth + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3];

                if (a > 0) {
                    // Only draw non-transparent pixels
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    onMount(() => {
        ctx = canvas.getContext("2d")!;
        img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            pixelateImage();
        };

        $effect(() => {
            if (src) {
                img.src = src;
            }
        });
    });

    // Re-pixelate when props change
    $effect(() => {
        if (img && img.complete) {
            pixelateImage();
        }
    });
</script>

<canvas
    bind:this={canvas}
    class={className}
    {width}
    {height}
    aria-label={alt}
    style="image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;"
    {...restProps}
></canvas>
