import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface PhotosStepProps {
    photos: File[];
    setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
}

const PhotosStep: React.FC<PhotosStepProps> = ({ photos, setPhotos }) => {
    return (
        <div className="mb-4">
            <label className="block mb-2 font-semibold">Upload Photos (optional)</label>

            <div className="flex items-center gap-4 mb-4">
                <button
                    type="button"
                    onClick={() => document.getElementById("photoUpload")?.click()}
                    className="w-12 h-12 flex items-center justify-center border-2 border-dashed rounded text-gray-500 hover:bg-gray-100 text-2xl"
                >
                    +
                </button>
                <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) {
                            const newPhotos = Array.from(e.target.files);
                            setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
                        }
                    }}
                />
            </div>

            {photos.length > 0 && (
                <Carousel className="w-full max-w-xs mx-auto">
                    <CarouselContent>
                        {photos.map((photo, index) => (
                            <CarouselItem key={index} className="flex justify-center">
                                <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-48 object-cover rounded"
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            )}
        </div>
    );
};

export default PhotosStep;
