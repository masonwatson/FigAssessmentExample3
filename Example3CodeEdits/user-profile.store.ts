import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { UsersService } from "./users.service";
import { UserProfile } from "./user-profile.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { catchError, finalize, map, switchMap, throwError } from "rxjs";
import { PostPasswordResetRequest, PutUpdateProfileProfileRequest } from "./user-profile.api.models";
import { UserProfileForm } from "./user-profile.form.model";
import { FormGroup } from "@angular/forms";

@Injectable({ providedIn: 'root' })
export class UserProfileStore {
	private readonly usersService = inject(UsersService);
	private readonly destroyRef = inject(DestroyRef);

    readonly userProfile = signal<UserProfile | null>(null);

	// Changed errors as to not make the user have to interact with an alert
	readonly error = signal<string | null>(null);

	// Changed messages as to not make the user have to interact with an alert
	readonly message = signal<string | null>(null);

	// Used to let the client know that the system is currently working on something
	readonly spinner = signal(false);
	
	// I imagine we would have the logged in user's id stored in global state,
	// but I'm just going to use a hardcoded variable for now
	private readonly loggedInUserId = 313456;

	resetStatusSignals(): void {
		this.error.set(null);
		this.message.set(null);
		this.spinner.set(true);
	}

	loadUserProfile(): void {
		this.resetStatusSignals();

        this.usersService.getUserProfile$(this.loggedInUserId)
			.pipe(
				// Map the response from the getUserProfile$ call
				map(response => ({
					firstName: response.firstName,
					email: response.email,
					phone: response.phone,
					profilePictureUrl: response.profilePictureUrl,
				}) as UserProfile),
				finalize(() => this.spinner.set(false)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				// Update our userProfile signal 
				next: (response) => {
					this.userProfile.set(response);
				},
				error: (error) => {
					var err = "Error loading profile";
					console.error(`${err}:`, error);
					this.userProfile.set(null);
					this.error.set(err);
				}
			})
    }

	updateProfile(form: FormGroup<UserProfileForm>): void {
		this.resetStatusSignals();

		const updateProfileProfileRequest = {
			firstName: form.controls.firstName.value,
			email: form.controls.email.value,
			phone: form.controls.phone.value
		} as PutUpdateProfileProfileRequest;
		
		this.usersService.getCheckIfEmailExists$(this.userProfile()?.email ?? "")
			.pipe(
				catchError(error => {
					var err = "Validate Email Existance failed";
					console.error(`${err}:`, error);
					this.error.set(err);
					return throwError(() => error);
				}),
				// Stop the previous observable, as we're done with it
				switchMap((response) => {
					if (response.exists) {
						this.message.set('This email is already being used.');
						return throwError(() => new Error("Email is already being used."));
					}

					if (response.userId === this.loggedInUserId) {
						this.message.set('This email is tied to your account.');
						return throwError(() => new Error("Email is already tied to user's account."));
					}

					return this.usersService.putUpdateProfile$(updateProfileProfileRequest).pipe(
						catchError(error => {
							var err = "Update profile failed";
							console.error(`${err}:`, error);
							this.error.set(err);
							return throwError(() => error);
						})
					)
				}),
				// Map the response from the putUpdateProfile$ service call
				map(response => ({
					firstName: response.firstName,
					email: response.email,
					phone: response.phone,
					profilePictureUrl: response.profilePictureUrl,
				}) as UserProfile),
				finalize(() => this.spinner.set(false)),
				takeUntilDestroyed(this.destroyRef)
			).subscribe({
				// Update our userProfile signal
				next: (userProfile) => {
					this.userProfile.set(userProfile);
				}
			})
	}

	deleteProfile(): void {
		this.resetStatusSignals();
		
		// Again, this should be our logged-in user's id pulled from global state
		this.usersService.getUserProfile$(this.loggedInUserId)
			.pipe(
				finalize(() => this.spinner.set(false)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				// UserProfile should be null if successfully deleted and redirect since
				// there's no profile anymore. This would also be a good spot to let our global store
				// that it should clear any data associated with an account
				next: (_) => {
					this.userProfile.set(null);
					alert('Profile deleted successfully!');
					window.location.href = '/login';
				},
				error: (error) => {
					var err = "Error deleting profile";
					console.error(`${err}:`, error);
					this.error.set(err);
				}
			});
	}

    uploadProfilePicture(file: File): void {
		this.resetStatusSignals();

		const formData = new FormData();
		formData.append('userId', this.loggedInUserId.toString());
		formData.append('profilePicture', file);
		
		this.usersService.postProfilePicture$(formData)
			.pipe(
				// Map the response from the postProfilePicture$ call
				map(response => ({
					...this.userProfile(),
					profilePictureUrl: response.profilePictureUrl,
				}) as UserProfile),
				finalize(() => this.spinner.set(false)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				next: (response) => {
					this.userProfile.set(response);
					this.message.set('Profile picture updated successfully!');
				},
				error: (error) => {
					console.error('Error uploading profile picture:', error);
				}
			});
    }

    sendPasswordReset(): void {
		this.resetStatusSignals();

		var userPasswordResetRequest = {
			userId: this.loggedInUserId
		} as PostPasswordResetRequest;
		
		this.usersService.postPasswordReset$(userPasswordResetRequest)
			.pipe(
				finalize(() => this.spinner.set(false)),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe({
				next: (_) => {
					this.message.set('Password reset email sent!');
				},
				error: (error) => {
					console.error('Error sending password reset:', error);
				}
			});
    }
}