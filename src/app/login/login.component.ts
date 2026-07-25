import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userType: string = '';
  loginStepStarted: boolean = false;
  candidateOtp: string = '';

  // Admin
  adminUsername: string = '';
  adminPassword: string = '';

  // Voter
  voterId: string = '';
  enteredVoterOtp: string = '';
  voterAadhaarId: string = '';

  // Candidate
  candidateId: string = '';
  enteredOtp: string = '';
  otpSentToCandidate: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const routeUserType = this.route.snapshot.paramMap.get('userType');
    if (routeUserType === 'admin' || routeUserType === 'voter' || routeUserType === 'candidate') {
      this.userType = routeUserType;
      this.loginStepStarted = true;
    }
  }

  startLogin() {
    if (!this.userType) {
      alert('Please select a user type.');
      return;
    }
    this.router.navigate(['/login', this.userType]);
  }

  resetSelection() {
    this.loginStepStarted = false;
    this.userType = '';
    this.clearFormData();
    this.router.navigate(['/login']);
  }

  clearFormData() {
    this.adminUsername = '';
    this.adminPassword = '';
    this.voterId = '';
    this.candidateId = '';
  }

  loginAdmin() {
    if (!this.adminUsername || !this.adminPassword) {
      alert('Please enter admin username and password');
      return;
    }

    const loginPayload = {
      username: this.adminUsername,
      password: this.adminPassword
    };

    this.http.post('https://voterapp-backend1-production.up.railway.app/login', loginPayload, { responseType: 'text' }).subscribe({
      next: (response: string) => {
        console.log(response);
        if (response === 'Login successful') {
          alert('Login successful');
          this.router.navigate(['/admin-dashboard']);
        } else {
          alert('Invalid username or password');
        }
      },
      error: (error) => {
        console.error(error);
        alert('Login failed: Invalid credentials');
      }
    });
  }

  generateOtpForVoter() {
    if (!this.voterAadhaarId) {
      alert('Please enter Aadhaar ID');
      return;
    }

    const url = `https://voterapp-backend1-production.up.railway.app/login/generate/${this.voterAadhaarId}`;

    this.http.post<any>(url, {}).subscribe({
      next: (res) => {
        console.log('OTP response from server:', res);
        alert("OTP sent to mobile: " + res.mobileNumber + "\nYour OTP is: " + res.otp);
      },
      error: (error) => {
        console.error('Failed to send OTP:', error);
        alert('Failed to send OTP to voter');
      }
    });
  }


  verifyVoterOtp() {
    if (!this.enteredVoterOtp) {
      alert('Please enter the OTP');
      return;
    }

    if (!this.voterAadhaarId) {
      alert('Please enter Aadhaar ID');
      return;
    }

    const payload = new HttpParams()
      .set('aadhaarId', this.voterAadhaarId)
      .set('otp', this.enteredVoterOtp);

    this.http.post<any>('https://voterapp-backend1-production.up.railway.app/verifyVoterOtp', {}, {
      params: payload
    }).subscribe({
      next: (response) => {
        if (response.message === 'OTP verified successfully') {
          sessionStorage.setItem("voterId", response.vid);
          sessionStorage.setItem("voterName", response.name);
          sessionStorage.setItem("voterAadhaar", this.voterAadhaarId);
          alert('Login successful');
          this.router.navigate(['/voter-dashboard']);
        } else {
          alert(response.message || 'Invalid OTP');
        }
      },
      error: (error) => {
        console.error('OTP verification failed:', error);
        alert('OTP verification failed');
      }
    });
  }


  generateOtpForCandidate() {
    if (!this.candidateId) {
      alert('Please enter Candidate ID');
      return;
    }

    const url = `https://voterapp-backend1-production.up.railway.app/generateCandidateOtp/${this.candidateId}`;

    this.http.post<any>(url, {}).subscribe({
      next: (res) => {
        console.log('Candidate OTP response:', res);
        alert(`OTP: ${res.otp}\nMessage: ${res.message}`);
        this.otpSentToCandidate = true;
      },
      error: (error) => {
        console.error('Failed to send OTP:', error);
        alert('Failed to send OTP to candidate');
      }
    });
  }

  verifyCandidateOtp() {
    if (!this.enteredOtp || !this.candidateId) {
      alert('Please enter Candidate ID and OTP');
      return;
    }

    const params = new HttpParams()
      .set('candidateId', this.candidateId)
      .set('otp', this.enteredOtp);

    this.http.post<any>('https://voterapp-backend1-production.up.railway.app/verifyCandidateOtp', {}, { params }).subscribe({
      next: (res) => {
        if (res.message === 'OTP verified successfully') {
          alert('Login successful');
          sessionStorage.setItem("candId", res.candId);
          this.router.navigate(['/candidate-dashboard']);
        } else {
          alert(res.message || 'Invalid OTP');
        }
      },
      error: (error) => {
        console.error('OTP verification failed:', error);
        alert('OTP verification failed');
      }
    });
  }
}


