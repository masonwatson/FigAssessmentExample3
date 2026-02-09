import { FormControl } from "@angular/forms";

export interface UserProfileForm {
	firstName: FormControl<string | null>;
	email: FormControl<string | null>;
	phone: FormControl<string | null>;
}