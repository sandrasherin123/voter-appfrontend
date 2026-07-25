import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { VoterDashboardComponent } from './voter-dashboard/voter-dashboard.component';
import { CandidateDashboardComponent } from './candidate-dashboard/candidate-dashboard.component';
import { ElectionComponent } from './admin/election/election.component';
import { VotersComponent } from './admin/voters/voters.component';
import { CandidatesComponent } from './admin/candidates/candidates.component';
import { ConstituenciesComponent } from './admin/constituencies/constituencies.component';
import { ResultsComponent } from './admin/results/results.component';
import { AddComponent } from './voters/add/add.component';
import { DashboardComponent } from './voters/dashboard/dashboard.component';
import { CastvoteComponent } from './voters/castvote/castvote.component';
import { CandidatelogindashboardComponent } from './candidate/candidatelogindashboard/candidatelogindashboard.component';
import { CandidateDescriptionsComponentComponent } from './candidate/candidate-descriptions-component/candidate-descriptions-component.component';
import { ReportsComponent } from './admin/reports/reports.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    VoterDashboardComponent,
    CandidateDashboardComponent,
    ElectionComponent,
    VotersComponent,
    CandidatesComponent,
    ConstituenciesComponent,
    ResultsComponent,
    AddComponent,
    DashboardComponent,
    CastvoteComponent,
    CandidatelogindashboardComponent,
    CandidateDescriptionsComponentComponent,
    ReportsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
