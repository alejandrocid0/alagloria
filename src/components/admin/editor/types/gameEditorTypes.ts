
import { GameFormValues } from "../types";

export interface GameEditorFormData {
  form: any; // Using any since this is from react-hook-form
  isLoading: boolean;
  isSaving: boolean;
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (data: GameFormValues) => Promise<void>;
}

export interface GameData {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
  category?: string;
}
