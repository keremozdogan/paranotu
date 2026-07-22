using System.ComponentModel.DataAnnotations;

namespace Website1.Api.Models;

/* ===========================================================================
 *  İSTEK / YANIT SÖZLEŞMELERİ
 *  ---------------------------------------------------------------------------
 *  Buradaki alan adları, Next.js tarafındaki src/services/api.js ile birebir
 *  eşleşir. JSON serileştirme camelCase yapılandırıldığı için C#'ta PascalCase
 *  yazmak yeterli (Buy -> buy).
 * ========================================================================= */

// --- Döviz / altın kurları -------------------------------------------------

public record RateItem(
    string Code,
    string Name,
    decimal Buy,
    decimal Sell,
    decimal ChangePercent);

/// <param name="UpdatedAt">Verinin ait olduğu bülten zamanı (isteğin yapıldığı an değil).</param>
/// <param name="Source">Kaynak adı — UI'da atıf olarak gösterilir.</param>
/// <param name="SourceUrl">Kaynağın doğrulanabilir adresi.</param>
public record RatesResponse(
    DateTimeOffset UpdatedAt,
    string Source,
    string SourceUrl,
    IReadOnlyList<RateItem> Items);

// --- Bülten ----------------------------------------------------------------

public class SubscribeRequest
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi gir.")]
    [MaxLength(320)]
    public string Email { get; init; } = string.Empty;

    /// <summary>Aboneliğin hangi sayfadan geldiği (home-sidebar, post:slug ...).</summary>
    [MaxLength(120)]
    public string Source { get; init; } = "web";
}

public record SubscribeResponse(bool Success, string Message);

public record Subscriber(
    Guid Id,
    string Email,
    string Source,
    DateTimeOffset CreatedAt);

// --- Yorumlar --------------------------------------------------------------

public class CommentRequest
{
    [Required, MaxLength(200)]
    public string Slug { get; init; } = string.Empty;

    [Required(ErrorMessage = "Ad zorunludur."), MaxLength(80)]
    public string Author { get; init; } = string.Empty;

    [EmailAddress, MaxLength(320)]
    public string? Email { get; init; }

    [Required, MinLength(3), MaxLength(4000)]
    public string Content { get; init; } = string.Empty;
}

public record CommentDto(
    Guid Id,
    string Slug,
    string Author,
    string Content,
    DateTimeOffset CreatedAt);

// --- İletişim --------------------------------------------------------------

public class ContactRequest
{
    [Required, MaxLength(120)]
    public string Name { get; init; } = string.Empty;

    [Required, EmailAddress, MaxLength(320)]
    public string Email { get; init; } = string.Empty;

    [MaxLength(200)]
    public string? Subject { get; init; }

    [Required, MinLength(10), MaxLength(5000)]
    public string Message { get; init; } = string.Empty;
}

// --- Yazı istatistikleri ---------------------------------------------------

public record PostStats(string Slug, long Views);
