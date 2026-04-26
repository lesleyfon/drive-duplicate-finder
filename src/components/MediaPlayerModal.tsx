import { Loader2, Music, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FileRecord } from "../types/drive";

interface MediaPlayerModalProps {
	file: FileRecord;
	accessToken: string;
	onClose: () => void;
}

export function MediaPlayerModal({ file, accessToken, onClose }: MediaPlayerModalProps) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const isVideo = file.mimeType.startsWith("video/");
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		dialogRef.current?.showModal();
	}, []);

	useEffect(() => {
		let objectUrl: string | null = null;
		setLoading(true);
		setError(null);
		setBlobUrl(null);

		fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
			.then((res) => {
				if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
				return res.blob();
			})
			.then((blob) => {
				objectUrl = URL.createObjectURL(blob);
				setBlobUrl(objectUrl);
				setLoading(false);
			})
			.catch((err: unknown) => {
				setError(err instanceof Error ? err.message : "Failed to load media");
				setLoading(false);
			});

		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [file.id, accessToken]);

	return (
		<dialog
			ref={dialogRef}
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
			onKeyDown={(e) => {
				if (e.target === dialogRef.current && e.key === "Enter") onClose();
			}}
			className="bg-transparent p-4 w-full max-w-2xl backdrop:bg-black/75"
		>
			<div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
					<p className="font-medium text-gray-800 truncate pr-4 text-sm">{file.name}</p>
					<button
						type="button"
						onClick={onClose}
						className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Player */}
				{loading && (
					<div className="flex items-center justify-center py-16 bg-gray-50">
						<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
					</div>
				)}
				{error && (
					<div className="px-6 py-10 text-center text-sm text-red-500 bg-gray-50">
						Failed to load media: {error}
					</div>
				)}
				{blobUrl && isVideo && (
					<div className="bg-black">
						<video
							controls
							autoPlay
							src={blobUrl}
							className="w-full max-h-[60vh] block"
						>
							<track kind="captions" />
						</video>
					</div>
				)}
				{blobUrl && !isVideo && (
					<div className="px-6 py-10 flex flex-col items-center gap-5 bg-gray-50">
						<div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
							<Music className="w-9 h-9 text-blue-500" />
						</div>
						<audio controls autoPlay src={blobUrl} className="w-full">
							<track kind="captions" />
						</audio>
					</div>
				)}
			</div>
		</dialog>
	);
}
