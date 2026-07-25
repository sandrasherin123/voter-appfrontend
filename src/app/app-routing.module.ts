// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { VoterDashboardComponent } from './voter-dashboard/voter-dashboard.component';
import { CandidateDashboardComponent } from './candidate-dashboard/candidate-dashboard.component';
import { ElectionComponent } from './admin/election/election.component';
import { VotersComponent } from './admin/voters/voters.component';
import { CandidatesComponent } from './admin/candidates/candidates.component';
import { ConstituenciesComponent } from './admin/constituencies/constituencies.component';
import { ResultsComponent } from './admin/results/results.component';
import { DashboardComponent } from './voters/dashboard/dashboard.component';
import { CastvoteComponent } from './voters/castvote/castvote.component';
import { CandidatelogindashboardComponent } from './candidate/candidatelogindashboard/candidatelogindashboard.component';
import { CandidateDescriptionsComponentComponent } from './candidate/candidate-descriptions-component/candidate-descriptions-component.component';
import { ReportsComponent } from './admin/reports/reports.component'

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },  // default login with selection
  { path: 'login/:userType', component: LoginComponent }, // for route based login
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'voter-dashboard', component: VoterDashboardComponent },
  { path: 'candidate-dashboard', component: CandidateDashboardComponent },
  {
    path: 'admin',
    children: [
      { path: 'election', component: ElectionComponent },
      { path: 'voters', component: VotersComponent },
      { path: 'candidates', component: CandidatesComponent },
      { path: 'constituencies', component: ConstituenciesComponent },
      { path: 'results', component: ResultsComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },
  {
    path: 'voters',
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'castvote', component: CastvoteComponent }
    ]
  },
  {
    path: 'candidate',
    children: [
      { path: 'candidateLoginDashboard', component: CandidatelogindashboardComponent },
      { path: 'constituency/:constId/descriptions', component: CandidateDescriptionsComponentComponent }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
