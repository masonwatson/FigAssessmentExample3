// getUserProfile
export interface GetUserProfileResponse {
	firstName: string;
	email: string;
	phone: string;
	profilePictureUrl: string;
}

// getCheckIfEmailExists
export interface GetCheckIfEmailExistsResponse {
	exists: boolean;
	userId: number;
}

//putUpdateProfile
export interface PutUpdateProfileProfileRequest {
	firstName: string | null;
	email: string | null;
	phone: string | null;
}

export interface PutUpdateProfileProfileResponse {
	firstName: string;
	email: string;
	phone: string;
	profilePictureUrl: string;
}

// postProfilePicture
export interface PostProfilePictureResponse {
	profilePictureUrl: string
}

// postPasswordReset
export interface PostPasswordResetRequest {
	userId: number
}