import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, ArrowRight, ArrowLeft, X, Image } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface StepUploadProps {
  imagePreview: string;
  onUpload: (file: File, preview: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepUpload: React.FC<StepUploadProps> = ({ imagePreview, onUpload, onNext, onBack }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const clearImage = () => {
    onUpload(null as unknown as File, '');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Your Photo</h1>
        <p className="text-muted-foreground">Take a photo of your room or upload an existing one</p>
      </div>

      {imagePreview ? (
        <Card className="mb-8 overflow-hidden roomyfy-card-shadow">
          <CardContent className="p-0 relative">
            <img
              src={imagePreview}
              alt="Room preview"
              className="w-full aspect-[4/3] object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card
          {...getRootProps()}
          className={`mb-8 cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary border-2 bg-primary/5'
              : 'border-dashed hover:border-primary/50'
          }`}
        >
          <CardContent className="p-12">
            <input {...getInputProps()} />
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                {isDragActive ? (
                  <Image className="h-10 w-10 text-primary animate-pulse" />
                ) : (
                  <Upload className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop your image here' : 'Drag & drop your room photo'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse from your device
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: JPG, PNG, WebP (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          size="lg"
          className="roomyfy-gradient"
          disabled={!imagePreview}
          onClick={onNext}
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default StepUpload;
