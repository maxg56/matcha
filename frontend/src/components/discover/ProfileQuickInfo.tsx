interface ProfileQuickInfoProps {
  location?: string;
  distance?: number;
  occupation?: string;
  educationLevel?: string;
  childrenStatus?: string;
}

export function ProfileQuickInfo({
  location,
  distance,
  occupation,
  educationLevel,
  childrenStatus
}: ProfileQuickInfoProps) {
  const infoItems = [
    {
      icon: "📍",
      value: location && distance !== undefined ? `${location} • ${Math.round(distance)}km` : location,
      show: !!location
    },
    {
      icon: "💼",
      value: occupation,
      show: !!occupation
    },
    {
      icon: "🎓",
      value: educationLevel,
      show: !!educationLevel,
      className: "capitalize"
    },
    {
      icon: "👶",
      value: childrenStatus === 'yes' ? 'A des enfants' : 'Sans enfants',
      show: !!childrenStatus,
      className: "capitalize"
    }
  ];

  const visibleItems = infoItems.filter(item => item.show);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {visibleItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span>{item.icon}</span>
          <span className={item.className}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}