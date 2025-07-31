import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PaymentService,
  PaymentStatusResponse,
} from '../../services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <!-- Loading State -->
        @if(isLoading){
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Verifying payment status...</p>
        </div>
        } @else if(paymentStatus !== null && paymentStatus.success){
        <!-- Success State -->
        <div class="text-center">
          <div
            class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
          >
            <svg
              class="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p class="text-gray-600 mb-8">
            Your transaction has been completed successfully.
          </p>

          <div class="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h3
              class="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Transaction Details
            </h3>

            <div class="space-y-3">
              <div
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span class="text-gray-600">Transaction ID</span>
                <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{{
                  paymentStatus.data?.transactionId || 'N/A'
                }}</span>
              </div>

              <div
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span class="text-gray-600">Merchant Transaction ID</span>
                <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{{
                  paymentStatus.data?.merchantTransactionId || 'N/A'
                }}</span>
              </div>

              <div
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span class="text-gray-600">Amount Paid</span>
                <span class="font-bold text-green-600 text-lg"
                  >₹{{ formatAmount(paymentStatus.data?.amount) }}</span
                >
              </div>

              <div
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span class="text-gray-600">Payment Method</span>
                <span class="font-medium">{{
                  paymentStatus.data?.paymentInstrument?.type || 'N/A'
                }}</span>
              </div>

              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600">Status</span>
                <span
                  class="bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full text-sm"
                >
                  {{ paymentStatus.code || 'N/A' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              (click)="downloadReceipt()"
              class="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Download Receipt
            </button>

            <button
              (click)="goHome()"
              class="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6"
                ></path>
              </svg>
              Back to Home
            </button>
          </div>
        </div>
        } @else if(paymentStatus !== null && !paymentStatus.success){
        <!-- Error State -->
        <div class="text-center">
          <div
            class="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>

          <h1 class="text-3xl font-bold text-gray-800 mb-2">Payment Failed</h1>
          <p class="text-gray-600 mb-8">
            {{
              paymentStatus.message ||
                'Unable to verify payment status. Please try again.'
            }}
          </p>

          <button
            (click)="goHome()"
            class="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Back to Home
          </button>
        </div>
        }
      </div>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  transactionId = '';
  isLoading: boolean = true; // Start with loading state
  paymentStatus: PaymentStatusResponse | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.checkPaymentStatus();
  }

  checkPaymentStatus() {
    this.isLoading = true;
    this.paymentStatus = null; // Reset payment status

    this.transactionId = localStorage.getItem('currentTransactionId')!;
    if (!this.transactionId) {
      console.error('No transaction ID available for status check');
      this.isLoading = false;
      this.paymentStatus = {
        success: false,
        code: 'NO_TRANSACTION_ID',
        message: 'No transaction ID found',
      };
      this.cdr.detectChanges();
      return;
    }

    console.log('Checking payment status for transaction:', this.transactionId);

    this.paymentService.checkPaymentStatus(this.transactionId).subscribe({
      next: (response) => {
        console.log('Payment status response:', response);
        this.paymentStatus = response;
        this.isLoading = false;

        // Force change detection
        this.cdr.detectChanges();

        // Handle the response based on its structure
        if (response && response.success) {
          console.log('Payment verification successful');

          if (response.data?.state === 'COMPLETED') {
            console.log('Payment completed successfully');
            // Clear stored data after successful verification
            this.clearStoredData();
          }
        } else {
          console.log('Payment not completed, state:', response.data?.state);
        }
      },
      error: (error) => {
        console.error('Error checking payment status:', error);
        this.isLoading = false;
        this.paymentStatus = {
          success: false,
          code: 'STATUS_CHECK_FAILED',
          message: 'Failed to check payment status',
        };
        // Force change detection
        this.cdr.detectChanges();
      },
    });
  }

  formatAmount(amount: number | undefined): string {
    if (!amount) return '0.00';
    // Convert from paisa to rupees (assuming amount is in paisa)
    const rupees = amount / 100;
    return rupees.toFixed(2);
  }

  private getStoredItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  }

  private clearStoredData(): void {
    try {
      localStorage.removeItem('transactionId');
      localStorage.removeItem('merchantTransactionId');
      localStorage.removeItem('currentTransactionId');
      console.log('Cleared stored transaction data');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  downloadReceipt() {
    console.log('Generating receipt...');

    const receiptData = {
      transactionId: this.transactionId,
      merchantTransactionId: this.paymentStatus?.data?.merchantTransactionId,
      amount: this.paymentStatus?.data?.amount,
      status: this.paymentStatus?.code,
      paymentMethod: this.paymentStatus?.data?.paymentInstrument?.type,
      date: new Date().toLocaleString(),
    };

    // Create a simple text receipt
    const receiptText = `
PAYMENT RECEIPT
===============

Transaction ID: ${receiptData.transactionId}
Merchant Transaction ID: ${receiptData.merchantTransactionId}
Amount: ₹${this.formatAmount(receiptData.amount)}
Status: ${receiptData.status}
Payment Method: ${receiptData.paymentMethod}
Date: ${receiptData.date}

Thank you for using PhonePe!
    `.trim();

    try {
      // Create and download the receipt
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${
        this.paymentStatus?.data?.merchantTransactionId || 'payment'
      }.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      console.log('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  }

  goHome() {
    console.log('Navigating to home...');
    // Clear any remaining stored data before going home
    this.clearStoredData();
    this.router.navigate(['/']);
  }
}
