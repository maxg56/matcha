import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { SettingSection, TextInput } from '../index';
import type { UserProfile } from '@/data/UserProfileData';
import { useGeolocationCity } from '@/hooks/useGeolocationCity';

interface LocationCareerSectionProps {
	editingSection: string | null;
	getCurrentValue: <K extends keyof UserProfile>(field: K) => UserProfile[K];
	updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
	startEditing: (section: string) => void;
	saveChanges: () => void;
	cancelEditing: () => void;
}

export function LocationCareerSection({
	editingSection,
	getCurrentValue,
	updateField,
	startEditing,
	saveChanges,
	cancelEditing
}: LocationCareerSectionProps) {
	const isEditing = editingSection === 'location';
	const { city, getCityFromGeolocation } = useGeolocationCity();

	// ✅ Utilisation d’un effet pour mettre à jour le store
	useEffect(() => {
		if (city && getCurrentValue('currentCity') !== city) {
			updateField('currentCity', city);
		}
	}, [city, getCurrentValue, updateField]);

	const locationFields = [
		{
			field: 'birthCity' as const,
			label: 'Ville de naissance',
			placeholder: 'Où êtes-vous né(e) ?'
		},
		{
			field: 'currentCity' as const,
			label: 'Ville actuelle',
			placeholder: 'Où habitez-vous ?',
			button: true,
			onButtonClick: getCityFromGeolocation,
		},
		{
			field: 'job' as const,
			label: 'Profession',
			placeholder: 'Votre métier',
			button: true
		}
	];

	return (
		<SettingSection
			title="Localisation & Carrière"
			icon={<MapPin className="h-5 w-5" />}
			sectionKey="location"
			editable
			editingSection={editingSection}
			onStartEditing={startEditing}
			onSaveChanges={saveChanges}
			onCancelEditing={cancelEditing}
		>
			{locationFields.map(({ field, label, placeholder, button, onButtonClick }) => (
				<TextInput
					key={field}
					field={field}
					label={label}
					placeholder={placeholder}
					currentValue={getCurrentValue(field) as string}
					editingSection={isEditing}
					onChange={(field, value) => updateField(field as keyof UserProfile, value)}
					button={button}
					onButtonClick={onButtonClick}
				/>
			))}
		</SettingSection>
	);
}
