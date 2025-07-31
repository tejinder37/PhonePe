using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;
using PhonePePaymentAPI.Models;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace PhonePePaymentAPI.Controllers;

[ApiController]
[Route("api/test-payment")]
public class TestPaymentController(IHttpClientFactory httpClientFactory, IConfiguration configuration):ControllerBase
{
    
    private readonly IHttpClientFactory _httpClient = httpClientFactory;
    private readonly string _merchantId = configuration["PhonePe:MerchantId"]!;
    private readonly string _saltKey = configuration["PhonePe:SaltKey"]!;
    private readonly string _saltIndex = configuration["PhonePe:SaltIndex"]!;
    private readonly string _phonePayBaseUrl = configuration["PhonePe:BaseUrl"]!;
    private readonly string _redirectUrl = configuration["PhonePe:RedirectUrl"]!;
    private readonly string _callbackUrl = configuration["PhonePe:CallbackUrl"]!;


    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody]PaymentRequest request)
    {
        try
        {
            string transactionId = Guid.NewGuid().ToString();
            string merchantTransactionId = $"MT{DateTime.Now:yyyyMMddHHmmss}{new Random().Next(1000, 9999)}";
            //Merchant payload
            var paymentPayload = new
            {
                merchantId = _merchantId,
                merchantTransactionId = merchantTransactionId,
                merchantUserId = request.UserId,
                amount = request.Amount * 100,
                redirectUrl = $"{_redirectUrl}?transactionId={merchantTransactionId}",
                redirectMode = "POST",
                callbackUrl = _callbackUrl,
                mobileNumber = request.MobileNumber,
                paymentInstrument = new
                {
                    type = "PAY_PAGE"
                }

            };

            JsonSerializerOptions jsonOptions = new()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                PropertyNameCaseInsensitive = false
            };

            string jsonPayload = JsonSerializer.Serialize(paymentPayload, jsonOptions);
            string base64Payload = Convert.ToBase64String(Encoding.UTF8.GetBytes(jsonPayload));

            string checksumString = base64Payload + "/pg/v1/pay" + _saltKey;
            string checksum = GenerateSHA256Hash(checksumString) + "###" + _saltIndex;

            var httpClient = _httpClient.CreateClient();
            httpClient.DefaultRequestHeaders.Add("X-VERIFY", checksum);
            var phonePayRequest = new
            {
                request = base64Payload
            };

            HttpResponseMessage response = await httpClient.PostAsJsonAsync($"{_phonePayBaseUrl}/pg/v1/pay", phonePayRequest);
            string responseContent = await response.Content.ReadAsStringAsync();

            // Log the response for debugging
            Console.WriteLine($"PhonePe Response: {responseContent}");

            PhonePeResponse? phonePeResponse = JsonSerializer.Deserialize<PhonePeResponse>(responseContent);
            if(phonePeResponse != null && phonePeResponse.Success == true && phonePeResponse.Data?.InstrumentResponse?.RedirectInfo?.Url != null)
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

    [HttpGet("payment-success")]
    public IActionResult PaymentSuccess([FromQuery] string transactionId, [FromForm]IFormCollection formData)
    {
        // Log the payment success data
        Console.WriteLine($"Payment Success - Transaction ID: {transactionId}");
        Console.WriteLine($"Form Data: {JsonSerializer.Serialize(formData)}");

        // redirect to frontend url
        return Redirect("http://localhost:4200/payment-success?transactionId={transactionId}&status=success");
    }

    [HttpPost("callback")]
    public IActionResult PaymentCallback([FromBody]object callbackData)
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
            string checksumstring = $"/pg/v1/status/{_merchantId}/{transactionId}" + _saltKey;
            string checksum = GenerateSHA256Hash(checksumstring) + "###"+ _saltIndex;

            HttpClient httpClient = _httpClient.CreateClient();
            httpClient.DefaultRequestHeaders.Add("X-VERIFY", checksum);
            httpClient.DefaultRequestHeaders.Add("X-MERCHANT-ID", _merchantId);

            HttpResponseMessage response = await httpClient.GetAsync($"{_phonePayBaseUrl}/pg/v1/status/{_merchantId}/{transactionId}");
            string responseContent = await response.Content.ReadAsStringAsync();
            PaymentStatusResponse? statusResponse = JsonSerializer.Deserialize<PaymentStatusResponse>(responseContent);
            if (statusResponse != null) 
            {
                return Ok(statusResponse);
            }
            return BadRequest(new { success = false, message = "Payment status checking failed" });
        }
        catch (Exception ex)
        {

            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
    #region Private methods
    private string GenerateSHA256Hash(string input)
    {
        using(var sha256 = SHA256.Create())
        {
            byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(hashedBytes).ToLower();
        }
    }
    #endregion

}
