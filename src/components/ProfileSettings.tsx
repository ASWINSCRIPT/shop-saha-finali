
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit3, Check, X } from 'lucide-react';

interface ProfileSettingsProps {
  language: 'en' | 'ml';
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ language }) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const texts = {
    en: {
      profile: 'Profile Settings',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
    },
    ml: {
      profile: 'പ്രൊഫൈൽ സെറ്റിംഗ്സ്',
      firstName: 'പേരിന്റെ ആദ്യഭാഗം',
      lastName: 'കുടുംബപ്പേര്',
      email: 'ഇമെയിൽ',
      edit: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
      save: 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക',
      cancel: 'റദ്ദാക്കുക',
    }
  };

  const handleSave = async () => {
    try {
      await user?.update({
        firstName,
        lastName,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setIsEditing(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {texts[language].profile}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{texts[language].firstName}</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{texts[language].lastName}</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{texts[language].email}</Label>
          <Input
            id="email"
            value={user?.emailAddresses[0]?.emailAddress || ''}
            disabled
          />
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              {texts[language].edit}
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {texts[language].save}
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                {texts[language].cancel}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
