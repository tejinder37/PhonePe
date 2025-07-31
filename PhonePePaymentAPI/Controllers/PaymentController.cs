using Microsoft.AspNetCore.Mvc;
using PhonePePaymentAPI.Models;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace PhonePePaymentAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController(IHttpClientFactory httpClientFactory) : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
    private readonly string _merchantId = "PGTESTPAYUAT86"; // Test Merchant ID
    private readonly string _saltKey = "96434309-7796-489d-8924-ab56988a6076"; // Test Salt Key
    private readonly string _saltIndex = "1"; // Test Salt Index
    private readonly string _phonePeBaseUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox"; // UAT URL

    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody] PaymentRequest request)
    {
        try
        {
            var transactionId = Guid.NewGuid().ToString();
            var merchantTransactionId = $"MT{DateTime.Now:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";

            // Create payment payload
            var paymentPayload = new
            {
                merchantId = _merchantId,
                merchantTransactionId = merchantTransactionId,
                merchantUserId = request.UserId,
                amount = request.Amount * 100, // Amount in paise
                redirectUrl = $"https://localhost:7001/api/payment/payment-success?transactionId={merchantTransactionId}",
                redirectMode = "POST",
                callbackUrl = $"https://localhost:7001/api/payment/callback",
                mobileNumber = request.MobileNumber,
                paymentInstrument = new
                {
                    type = "PAY_PAGE"
                }
            };

            // JsonSerializer options for consistent serialization/deserialization
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = true
            };

            // Convert to base64
            var jsonPayload = JsonSerializer.Serialize(paymentPayload, jsonOptions);
            var base64Payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(jsonPayload));

            // Generate checksum
            var checksumString = base64Payload + "/pg/v1/pay" + _saltKey;
            var checksum = GenerateSHA256Hash(checksumString) + "###" + _saltIndex;

            // Create request to PhonePe
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Add("X-VERIFY", checksum);

            var phonePeRequest = new
            {
                request = base64Payload
            };

            var response = await httpClient.PostAsJsonAsync($"{_phonePeBaseUrl}/pg/v1/pay", phonePeRequest);
            var responseContent = await response.Content.ReadAsStringAsync();

            // Log the response for debugging
            Console.WriteLine($"PhonePe Response: {responseContent}");

            // Deserialize with proper options
            var phonePeResponse = JsonSerializer.Deserialize<PhonePeResponse>(responseContent, jsonOptions);

            if (phonePeResponse?.Success == true && phonePeResponse.Data?.InstrumentResponse?.RedirectInfo?.Url != null)
            {
                return Ok(new
                {
                    success = true,
                    paymentUrl = phonePeResponse.Data.InstrumentResponse.RedirectInfo.Url,
                    transactionId = merchantTransactionId
                });
            }

            return BadRequest(new { success = false, message = "Payment initiation failed" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("payment-success")]
    public IActionResult PaymentSuccess([FromQuery] string transactionId, [FromForm] IFormCollection formData)
    {
        // Log the payment success data
        Console.WriteLine($"Payment Success - Transaction ID: {transactionId}");
        Console.WriteLine($"Form Data: {JsonSerializer.Serialize(formData)}");

        // Redirect to frontend with success status
        return Redirect($"http://localhost:4200/payment-success?transactionId={transactionId}&status=success");
    }

    [HttpPost("callback")]
    public  IActionResult PaymentCallback([FromBody] object callbackData)
    {
        // Handle callback from PhonePe
        Console.WriteLine($"Callback received: {JsonSerializer.Serialize(callbackData)}");
        return Ok();
    }

    [HttpGet("status/{transactionId}")]
    public async Task<IActionResult> CheckPaymentStatus(string transactionId)
    {
        try
        {
            var checksumString = $"/pg/v1/status/{_merchantId}/{transactionId}" + _saltKey;
            var checksum = GenerateSHA256Hash(checksumString) + "###" + _saltIndex;

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Add("X-VERIFY", checksum);
            httpClient.DefaultRequestHeaders.Add("X-MERCHANT-ID", _merchantId);

            var response = await httpClient.GetAsync($"{_phonePeBaseUrl}/pg/v1/status/{_merchantId}/{transactionId}");
            var responseContent = await response.Content.ReadAsStringAsync();
            var statusResponse = JsonSerializer.Deserialize<PaymentStatusResponse>(responseContent);
            
            return Ok(statusResponse);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    private string GenerateSHA256Hash(string input)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(hashedBytes).ToLower();
        }
    }
}