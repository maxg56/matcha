import { MapPin } from 'lucide-react';
import { SettingSection, TextInput } from '../index';
import type { UserProfile } from '@/data/UserProfileData';

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
			onButtonClick: () => {
				if (!navigator.geolocation) {
					alert("La géolocalisation n'est pas supportée par votre navigateur.");
					return;
				}
				navigator.geolocation.getCurrentPosition(
					async (position) => {
						const { latitude, longitude } = position.coords;

						try {
							// Appel à l'API Nominatim pour récupérer la ville
							const response = await fetch(
								`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
							);

							const data = await response.json();
							const city = data.address.city || data.address.town || data.address.village || "Ville inconnue";

							updateField('currentCity', city);
						} catch (error) {
							alert("Impossible de récupérer le nom de la ville : " + (error as Error).message);
						}
					},
					(error) => {
						alert("Impossible de récupérer votre position : " + error.message);
					}
				);
			},
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