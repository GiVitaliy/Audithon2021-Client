import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './unavailable.component.html'
})
export class UnavailableComponent implements OnInit {

  unavailable = true;

  ngOnInit(): void {
  }

  constructor(private router: Router) {
  }
}
