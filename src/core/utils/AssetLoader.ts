/**
 * Preload an image and return a promise that resolves with the HTMLImageElement when loaded.
 * @param src The image source URL (relative to public/)
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (e) => reject(e);
		img.src = src;
	});
}
