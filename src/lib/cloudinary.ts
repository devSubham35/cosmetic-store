const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}

export function uploadToCloudinary(
    file: File,
    onProgress?: (percent: number) => void,
    abortSignal?: AbortSignal
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            reject(new Error("Cloudinary config missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"));
            return;
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                resolve({
                    url: data.secure_url,
                    publicId: data.public_id,
                });
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        if (abortSignal) {
            abortSignal.addEventListener("abort", () => xhr.abort());
        }

        xhr.send(formData);
    });
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
