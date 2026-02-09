import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/*
* Things I'm going to assumer:
* We are using Angular 17+, so we have access to signals and the inject function
* We have access to RxJS, since we're using HttpClient
*/

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

	// We should make an interface for this instead of using any, just to be type-safe!
	// We should also use a signal for userProfile, that way we can rerender when it's value changes
    userProfile: any;

	// I might be missing something, but I'm not sure if this class variable is necessary?
    isEditing = false;

	// This is totally fine, but if we end up importing more classes, would you mind injecting them? This
	// will help with readability!
    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadUserProfile();
    }

	// We should make a service file and a store file, just to make the component dedicated to UI!
	// The store will act as a layer for manipulating data as well as making service calls. The service
	// will be what calls the API.
    loadUserProfile(): void {
        this.http.get('https://api.mycompany.com/api/users/profile').subscribe(
            (data: any) => {
                this.userProfile = data;
            },
            (error) => {
                console.error('Error loading profile:', error);
            }
        );
    }

    updateProfile(): void {
        // Client-side validation using alerts
		// If you don't mind, I think we should use angular forms for managing user input!
		// This is currently taking the class variable that we assigned on loadUserProfile
		// and trying to use that to update. Other than that, good idea adding the client-side validation!
        if (!this.userProfile.firstName || this.userProfile.firstName.trim() === '') {
			// Client-side alerts are great at getting people's attention! Would you mind using a signal 
			// that holds errors though? This gives us an easy way to display error messages to the user, 
			// predictability for debugging, and opens the possibility to react to error messages!
            alert('First name is required!');
            return;
        }

        if (!this.userProfile.email || !this.userProfile.email.includes('@')) {
			// This will need the same update described in lines 52-54
            alert('Valid email is required!');
            return;
        }

        if (!this.userProfile.phone || this.userProfile.phone.length < 10) {
			// This will need the same update described in lines 52-54
            alert('Phone number must be at least 10 digits!');
            return;
        }

		// I believe lines 74-108 would need the update mentioned on lines 32-34
		// Careful! I think this is using the email address assigned to the class variable, not the email address typed in an input!
        // Check if email already exists
        this.http.get(`https://api.mycompany.com/api/users/check-email/${this.userProfile.email}`).subscribe(
            (response: any) => {
				// I think we should separate the check to see if if the response user id is the same as the current user id, I 
				// believe the error message for this scenario should be slightly more specific "This email is tied to your account"
                if (response.exists && response.userId !== this.userProfile.id) {
					// This will need the same update described in lines 52-54
                    alert('Email already exists!');
                    return;
                }

				// I like the thinking, but nested subscribes are pretty risky, they can cause memory leaks if
				// the inner subscription is not properly cleaned up, we could use the rxjs pipe operator and a switchMap 
				// to make a less-risky chain of API calls!
                // Update the profile
                this.http.put('https://api.mycompany.com/api/users/profile', this.userProfile).subscribe(
                    (response: any) => {
						// Again, client-side alerts are great at getting people's attention! Would you mind using a signal 
						// that holds messages though? This gives us an easy way to display messages to the user, 
						// predictability for debugging, and opens the possibility to react to messages!
                        alert('Profile updated successfully!');
                        this.isEditing = false;
                        this.loadUserProfile(); // Reload the entire profile instead of using the response
                    },
                    (error) => {
						// This will need the same update described in lines 52-54
                        alert('Failed to update profile. Please try again.');
                    }
                );
            },
            (error) => {
				// This will need the same update described in lines 52-54
                alert('Error checking email availability.');
            }
        );
    }

    deleteProfile(): void {
        if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
			// Lines 114-121 would also need the update mentioned on lines 32-34
			// I think we might be missing a path parameter!
            this.http.delete('https://api.mycompany.com/api/users/profile').subscribe(
                (response: any) => {
					// This will need the same update described in lines 90-92
                    alert('Profile deleted successfully!');
                    // Redirect to login page
                    window.location.href = '/login';
                }
            );
        }
    }

    uploadProfilePicture(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Simple file validation
            if (file.size > 5000000) { // 5MB
				// This will need the same update described in lines 52-54
                alert('File size must be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
				// This will need the same update described in lines 52-54
                alert('Only image files are allowed');
                return;
            }

            const formData = new FormData();
            formData.append('profilePicture', file);

			// Same here, the lines 145-151 would need the update mentioned on lines 32-34
            this.http.post('https://api.mycompany.com/api/users/profile/picture', formData).subscribe(
                (response: any) => {
                    this.userProfile.profilePictureUrl = response.profilePictureUrl;
					// This will need the same update described in lines 90-92
                    alert('Profile picture updated successfully!');
                }
            );
        }
    }

    sendPasswordReset(): void {
		// Last spot! The lines 158-165 would need the update mentioned on lines 32-34
		// I think this call might also be missing a path parameter!
        this.http.post('https://api.mycompany.com/api/auth/reset-password', {
            email: this.userProfile.email
        }).subscribe(
            (response: any) => {
				// This will need the same update described in lines 90-92
                alert('Password reset email sent!');
            }
        );
    }

	// I might be wrong, but I don't think this function is necessary!
    toggleEdit(): void {
        this.isEditing = !this.isEditing;
    }

    cancelEdit(): void {
		// Again, I might be wrong, but this class variable seems unnecessary!
        this.isEditing = false;

		// If we used a form, we wouldn't have to 
        this.loadUserProfile(); // Reload to discard changes
    }
}