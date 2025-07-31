using System.Text.Json.Serialization;

namespace PhonePePaymentAPI.Models;

public class PaymentRequest
{
    public string UserId { get; set; } = "";
    public decimal Amount { get; set; }
    public string MobileNumber { get; set; } = "";
}

public class PhonePeResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("code")]
    public string Code { get; set; } = "";

    [JsonPropertyName("message")]
    public string Message { get; set; } = "";

    [JsonPropertyName("data")]
    public PhonePeData? Data { get; set; }
}

public class PhonePeData
{
    [JsonPropertyName("merchantId")]
    public string MerchantId { get; set; } = "";

    [JsonPropertyName("merchantTransactionId")]
    public string MerchantTransactionId { get; set; } = "";

    [JsonPropertyName("instrumentResponse")]
    public InstrumentResponse? InstrumentResponse { get; set; }
}

public class InstrumentResponse
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "";

    [JsonPropertyName("redirectInfo")]
    public RedirectInfo? RedirectInfo { get; set; }
}

public class RedirectInfo
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = "";

    [JsonPropertyName("method")]
    public string Method { get; set; } = "";
}

public class PaymentStatusResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("code")]
    public string Code { get; set; } = "";

    [JsonPropertyName("message")]
    public string Message { get; set; } = "";

    [JsonPropertyName("data")]
    public PaymentStatusData? Data { get; set; }
}

public class PaymentStatusData
{
    [JsonPropertyName("merchantId")]
    public string MerchantId { get; set; } = "";

    [JsonPropertyName("merchantTransactionId")]
    public string MerchantTransactionId { get; set; } = "";

    [JsonPropertyName("transactionId")]
    public string TransactionId { get; set; } = "";

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("state")]
    public string State { get; set; } = "";

    [JsonPropertyName("responseCode")]
    public string ResponseCode { get; set; } = "";

    [JsonPropertyName("paymentInstrument")]
    public PaymentMethod? PaymentInstrument { get; set; }
}

public class PaymentMethod
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "";
}