import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentRequest } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div
            class="bg-gradient-to-r from-purple-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              ></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">PhonePe Payment</h1>
          <p class="text-gray-600">Secure and Fast Payment Gateway</p>
        </div>

        <form (ngSubmit)="initiatePayment()" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >User ID</label
              >
              <input
                type="text"
                [(ngModel)]="paymentData.userId"
                name="userId"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                placeholder="Enter your user ID"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Amount (₹)</label
              >
              <input
                type="number"
                [(ngModel)]="paymentData.amount"
                name="amount"
                required
                min="1"
                step="0.01"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Mobile Number</label
              >
              <input
                type="tel"
                [(ngModel)]="paymentData.mobileNumber"
                name="mobileNumber"
                required
                pattern="[0-9]{10}"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                placeholder="Enter 10-digit mobile number"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="isLoading"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span *ngIf="!isLoading" class="flex items-center justify-center">
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              Pay Securely with PhonePe
            </span>
            <span *ngIf="isLoading" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          </button>
        </form>

        <div
          *ngIf="errorMessage"
          class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div class="flex items-center">
            <svg
              class="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p class="text-red-700 text-sm">{{ errorMessage }}</p>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Test Mode: Use any valid 10-digit mobile number
          </p>
          <div class="flex items-center justify-center mt-2 space-x-4">
            <div class="flex items-center">
              <svg
                class="w-4 h-4 text-green-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-xs text-gray-600">SSL Secured</span>
            </div>
            <div class="flex items-center">
              <svg
                class="w-4 h-4 text-green-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-xs text-gray-600">PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentComponent {
  paymentData: PaymentRequest = {
    userId: '',
    amount: 0,
    mobileNumber: '',
  };

  isLoading = false;
  errorMessage = '';

  constructor(private paymentService: PaymentService, private router: Router) {}

  initiatePayment() {
    if (!this.isValidForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Initiating payment with data:', this.paymentData);

    this.paymentService.initiatePayment(this.paymentData).subscribe({
      next: (response) => {
        console.log('Payment response received:', response);

        this.isLoading = false;

        if (response.success && response.paymentUrl) {
          // Store transaction details for later verification
          if (response.transactionId) {
            localStorage.setItem(
              'currentTransactionId',
              response.transactionId
            );
            localStorage.setItem(
              'paymentAmount',
              this.paymentData.amount.toString()
            );
            localStorage.setItem('paymentUserId', this.paymentData.userId);

            console.log('Stored transaction details:', {
              transactionId: response.transactionId,
              amount: this.paymentData.amount,
              userId: this.paymentData.userId,
            });
          }

          // Add a small delay to ensure localStorage is set
          setTimeout(() => {
            console.log('Redirecting to PhonePe URL:', response.paymentUrl);
            // Redirect to PhonePe payment gateway
            window.location.href = response.paymentUrl!; 
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Payment initiation failed';
          console.error('Payment initiation failed:', response);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'An error occurred while processing payment';
        console.error('Payment error:', error);
      },
    });
  }

  private isValidForm(): boolean {
    if (!this.paymentData.userId.trim()) {
      this.errorMessage = 'Please enter a valid User ID';
      return false;
    }

    if (!this.paymentData.amount || this.paymentData.amount <= 0) {
      this.errorMessage = 'Please enter a valid amount';
      return false;
    }

    if (
      !this.paymentData.mobileNumber ||
      !/^[0-9]{10}$/.test(this.paymentData.mobileNumber)
    ) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number';
      return false;
    }

    this.errorMessage = '';
    return true;
  }
}
