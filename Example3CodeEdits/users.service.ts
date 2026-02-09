import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';
import { UserProfile } from './user-profile.model';
import { PostProfilePictureResponse, PostPasswordResetRequest, PutUpdateProfileProfileResponse, GetCheckIfEmailExistsResponse, GetUserProfileResponse, PutUpdateProfileProfileRequest } from './user-profile.api.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.myCompanyApiBaseUrl}/users/`;

  getUserProfile$(userId: number): Observable<GetUserProfileResponse> {
    const url = `${this.baseUrl}/users/profile/${encodeURIComponent(userId)}`;
    return this.http.get<GetUserProfileResponse>(url);
  }

  getCheckIfEmailExists$(email: string): Observable<GetCheckIfEmailExistsResponse> {
    const url = `${this.baseUrl}/users/check-email/${encodeURIComponent(email)}`;
	return this.http.get<GetCheckIfEmailExistsResponse>(url);
  }

  putUpdateProfile$(requestData: PutUpdateProfileProfileRequest): Observable<PutUpdateProfileProfileResponse> {
    const url = `${this.baseUrl}/users/profile`;
	return this.http.post<PutUpdateProfileProfileResponse>(url, requestData);
  }

  deleteUserProfile$(profileId: number): Observable<any> {
	const url = `${this.baseUrl}/users/profile/delete/${profileId}`;
	return this.http.delete<UserProfile>(url);
  }

  postProfilePicture$(requestData: FormData): Observable<PostProfilePictureResponse> {
	const url = `${this.baseUrl}/users/profile/picture/`;
	return this.http.post<PostProfilePictureResponse>(url, requestData);
  }

  postPasswordReset$(userPasswordResetRequest: PostPasswordResetRequest): Observable<any> {
	const url = `${this.baseUrl}/auth/reset-password`;
	return this.http.post<any>(url, userPasswordResetRequest)
  }
}