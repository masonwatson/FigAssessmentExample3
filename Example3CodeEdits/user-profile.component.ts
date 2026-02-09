import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserProfileStore } from './user-profile.store';
import { UserProfileForm } from './user-profile.form.model';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
	// Using a store to make the component only foucs on UI
	private readonly store = inject(UserProfileStore);

	// Sharing the signals from the store, because they're important to the UI,
	// but the component, for the most part, should not dictate how they have data 
	readonly userProfile = this.store.userProfile;
	readonly error = this.store.error;
	readonly message = this.store.message;
	readonly spinner = this.store.spinner;

	readonly form = new FormGroup<UserProfileForm>({
		firstName: new FormControl('', [Validators.required, Validators.pattern(/^\s+$/)]),
		email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(/^\s+$/)]),
		phone: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\s+$/)])
	});

    ngOnInit(): void {
        this.loadUserProfile();
    }

	loadUserProfile(): void {
		this.store.loadUserProfile();
		
		this.form.reset({
			firstName: this.userProfile()?.firstName ?? "",
			email: this.userProfile()?.email ?? "",
			phone: this.userProfile()?.phone ?? ""
		});
	}

	updateProfile(): void {
        // Client-side validation
		if (!this.userProfile()) {
			this.error.set('Error loading profile');
			return;
		}

		if (!!this.form.controls.firstName?.invalid) {
			this.error.set('First name is invalid!');
            return;
		}
		
		if (!!this.form.controls.email?.invalid) {
			this.error.set('First name is invalid!');
            return;
		}
		
		if (!!this.form.controls.phone?.invalid) {
			this.error.set('Phone number is invalid!');
            return;
		}
		
        this.store.updateProfile(this.form);
	}

	deleteProfile(): void {
        if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
			this.store.deleteProfile();
		}
	}

	uploadProfilePicture(event: any): void {
		const file = event.target?.files[0] as File | null;

		// Client-side validation
		if (!file) {
			this.error.set('You must have an image if you want to upload!');
			return;
		}

		if (file?.size ?? 0 > 5000000) { // 5MB
			this.error.set('File size must be less than 5MB');
			return;
		}

		if (!file?.type.startsWith('image/')) {
			this.error.set('Only image files are allowed');
			return;
		}

		this.store.uploadProfilePicture(file);
	}

	sendPasswordReset(): void {
		this.store.sendPasswordReset();
	}

    cancelEdit(): void {
        this.form.reset({
			firstName: this.userProfile()?.firstName ?? "",
			email: this.userProfile()?.email ?? "",
			phone: this.userProfile()?.phone ?? ""
		});
    }
}