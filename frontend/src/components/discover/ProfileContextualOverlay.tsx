interface ContextualInfo {
  title: string;
  items: Array<{
    label: string | null | undefined;
    value: string | null | undefined;
    icon: string;
  }>;
}

interface ProfileContextualOverlayProps {
  currentInfo: ContextualInfo | null | undefined;
  currentImageIndex: number;
  totalImages: number;
}

export function ProfileContextualOverlay({
  currentInfo,
  currentImageIndex,
  totalImages
}: ProfileContextualOverlayProps) {
  if (!currentInfo || totalImages <= 1) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-20">
      <div className="text-white">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="text-sm bg-white/20 rounded-full px-2 py-1">
            {currentImageIndex + 1}/{totalImages}
          </span>
          {currentInfo.title}
        </h3>
        <div className="flex flex-col gap-2">
          {currentInfo.items
            .filter(item => item.value)
            .slice(0, 1)
            .map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <span className="text-base">{item.icon}</span>
                <span className="text-gray-200">{item.label}:</span>
                <span className="font-medium text-white capitalize">{item.value}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}