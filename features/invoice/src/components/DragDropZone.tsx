import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud as UploadCloudIcon, 
  FileText as FileTextIcon, 
  Loader2 as Loader2Icon, 
  Sparkles as SparklesIcon 
} from "lucide-react";

const UploadCloud = UploadCloudIcon as any;
const FileText = FileTextIcon as any;
const Loader2 = Loader2Icon as any;
const Sparkles = SparklesIcon as any;
import { toast } from "sonner";

interface DragDropZoneProps {
  onFileUploaded: (file: { name: string; size: number; previewUrl?: string; type?: string }) => void;
}

export function DragDropZone({ onFileUploaded }: DragDropZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFile, setProcessingFile] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      
      for (const file of acceptedFiles) {
        setProcessingFile(file.name);
        setUploadProgress(0);

        // 1. Giả lập thanh tiến trình upload tệp tin (0% -> 100%)
        await new Promise<void>((resolve) => {
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 20) + 10;
            if (currentProgress >= 100) {
              currentProgress = 100;
              clearInterval(interval);
              setUploadProgress(100);
              setTimeout(resolve, 300);
            } else {
              setUploadProgress(currentProgress);
            }
          }, 100);
        });

        // Đã hoàn tất tải lên tệp tin hóa đơn ảo
        toast.success(`Đã tải lên tệp tin "${file.name}" thành công!`);
        
        // Tạo URL xem trước nếu là hình ảnh
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        
        if (previewUrl && typeof window !== "undefined") {
          if (!(window as any).imagePreviewCache) {
            (window as any).imagePreviewCache = {};
          }
          (window as any).imagePreviewCache[file.name] = previewUrl;
          (window as any).imagePreviewCache[`/mock-storage/${file.name}`] = previewUrl;
        }
        
        // Gọi callback truyền tệp lên trang chính để mở Form nhập liệu thủ công
        onFileUploaded({
          name: file.name,
          size: file.size,
          previewUrl,
          type: file.type
        });
      }

      setIsUploading(false);
      setProcessingFile(null);
      setUploadProgress(0);
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
  });

  // Render vùng kéo thả tệp tin với micro-animations và thanh tiến trình
  return (
    <div
      {...getRootProps()}
      className={`relative overflow-hidden p-8 border-2 border-dashed rounded-2xl transition-all duration-300 text-center select-none ${
        isDragActive
          ? "border-indigo-500 bg-indigo-50/50 shadow-inner scale-[1.01]"
          : isUploading
          ? "border-neutral-200 bg-neutral-50/50 cursor-not-allowed"
          : "border-neutral-300 bg-white hover:border-indigo-400 hover:shadow-md cursor-pointer hover:bg-neutral-50/20"
      }`}
    >
      <input {...getInputProps()} />

      {/* Hiệu ứng tia sáng trang trí */}
      <div className="absolute top-2 right-2 opacity-10">
        <Sparkles className="h-12 w-12 text-indigo-500" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <div className="flex flex-col items-center space-y-3 w-full max-w-xs mx-auto">
            <div className="relative flex items-center justify-center p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div className="w-full">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-600 mb-1">
                <span className="truncate max-w-[180px]">Đang tải: {processingFile}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-neutral-400 animate-pulse">Đang đính kèm tệp tin hóa đơn...</p>
          </div>
        ) : (
          <>
            <div
              className={`p-4 rounded-2xl transition-transform duration-300 ${
                isDragActive ? "bg-indigo-100 scale-110 text-indigo-600" : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {isDragActive ? "Thả hóa đơn vào đây ngay!" : "Kéo thả hoặc nhấp để đính kèm tệp hóa đơn"}
              </p>
              <p className="text-xs text-neutral-500 mt-1.5 flex items-center justify-center gap-1.5">
                <FileText className="h-3 w-3" />
                Hỗ trợ PDF, PNG, JPG, JPEG (tối đa 10MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

