import { Component, ViewChild, Inject, HostListener, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule, // ✅ Fix for *ngFor
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatSelectModule,  
    MatFormFieldModule,
    MatTabsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [provideAnimations()]
})
export class AppComponent  {
  @ViewChild('drawer') drawer!: MatDrawer;
  isMobile = false;
  isOrganised: boolean = false;
  unorganizedCode: string = ''; 
  tabSize: number = 4;
  tabSizes: number[] = [2, 4, 8]; // Define the list properly
  organizedCode='';

  constructor(@Inject(PLATFORM_ID) private platformId: object, private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;
    }
  }

  toggleDrawer() {
    if (this.isMobile && this.drawer) {
      this.drawer.toggle();
    }
  }
  formatCode() {
    if (!this.unorganizedCode.trim()) return;

    const payload = { question: this.unorganizedCode };
    this.http.post<any>('http://127.0.0.1:8000/ask', payload).subscribe({
      next: (response) => {
        console.log(response.optimized_code);
        this.organizedCode = response.optimized_code || "⚠️ AI did not provide a response.";
      },
      error: (error) => {
        console.error('Error fetching AI response:', error);
      }
    });
    this.isOrganised=true
  }
  clearCode() {
    this.unorganizedCode='';
    this.isOrganised = false;
  }
  copyCode() {
    const codeContent = this.organizedCode;
    if (codeContent) {
      navigator.clipboard.writeText(codeContent).then(() => {
        alert('Code copied to clipboard! ✅');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
}

downloadCode() {
  const codeContent = this.organizedCode; // Get the optimized code
  if (!codeContent) {
      alert('⚠️ No code to download!');
      return;
  }
  const blob = new Blob([codeContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'optimized_code.txt'; // File name
  document.body.appendChild(a);
  a.click(); // Trigger the download
  document.body.removeChild(a); // Cleanup
}
openInNewWindow() {
  const code = this.organizedCode;
  const newWindow = window.open();
  if (newWindow) {
    newWindow.document.write(code);
    newWindow.document.close();
  }
}

}
