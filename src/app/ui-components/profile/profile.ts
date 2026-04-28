import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../auth/auth.service';
import { API_BASE_URL } from '../../app.config';

@Component({
  selector: 'app-profile',
  imports: [NzModalModule, NzButtonModule, NzAvatarModule, NzIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  readonly authService = inject(AuthService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly userImageUrl = computed(() => {
    const image = this.authService.currentUserProfile().image;
    return image ? `${this.baseUrl}/images/user/${image}` : '';
  });

  readonly profile = computed(() => this.authService.currentUserProfile());
  readonly phoneDisplay = computed(() => this.profile().phoneNumber || 'Not available');

  handleClose(): void {
    this.authService.showProfile.set(false);
  }
}
