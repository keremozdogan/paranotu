using System.ComponentModel.DataAnnotations;
using Website1.Api.Models;
using Website1.Api.Services;

namespace Website1.Api.Endpoints;

/* ===========================================================================
 *  ENDPOINT TANIMLARI
 *  ---------------------------------------------------------------------------
 *  Next.js karşılığı: frontend/src/services/api.js
 *
 *    GET  /api/rates                    → getLiveRates()
 *    POST /api/newsletter/subscribe     → subscribeToNewsletter()
 *    GET  /api/comments?slug=...        → getComments()
 *    POST /api/comments                 → postComment()
 *    POST /api/contact                  → sendContactMessage()
 *    POST /api/posts/{slug}/view        → trackPostView()
 *    GET  /api/posts/{slug}/stats       → getPostStats()
 *    GET  /health                       → checkApiHealth()
 * ========================================================================= */

public static class EndpointExtensions
{
    /// <summary>
    /// DataAnnotations doğrulaması. Geçerliyse null, değilse 400 ProblemDetails döner.
    /// Kullanımı: <c>if (Validate(request) is { } problem) return problem;</c>
    /// </summary>
    private static IResult? Validate<T>(T model) where T : notnull
    {
        var results = new List<ValidationResult>();
        var isValid = Validator.TryValidateObject(
            model, new ValidationContext(model), results, validateAllProperties: true);

        if (isValid) return null;

        var errors = results
            .SelectMany(r => r.MemberNames.DefaultIfEmpty(string.Empty),
                        (r, member) => (member, message: r.ErrorMessage ?? "Geçersiz değer."))
            .GroupBy(x => x.member)
            .ToDictionary(g => g.Key, g => g.Select(x => x.message).ToArray());

        return Results.ValidationProblem(errors);
    }

    public static WebApplication MapApiEndpoints(this WebApplication app)
    {
        var api = app.MapGroup("/api").WithOpenApi();

        MapRates(api);
        MapNewsletter(api);
        MapComments(api);
        MapContact(api);
        MapPostStats(api);

        // Next.js checkApiHealth() bunu çağırır.
        app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTimeOffset.UtcNow }))
           .WithName("HealthCheck")
           .WithSummary("Servisin ayakta olup olmadığını bildirir.");

        return app;
    }

    // ---------------------------------------------------------------- KURLAR

    private static void MapRates(RouteGroupBuilder api)
    {
        api.MapGet("/rates", async (IRatesService rates, CancellationToken ct) =>
            {
                var result = await rates.GetRatesAsync(ct);
                return Results.Ok(result);
            })
            .WithName("GetRates")
            .WithSummary("Güncel döviz ve altın kurları.")
            .Produces<RatesResponse>();
    }

    // --------------------------------------------------------------- BÜLTEN

    private static void MapNewsletter(RouteGroupBuilder api)
    {
        api.MapPost("/newsletter/subscribe",
            async (SubscribeRequest request, INewsletterService service, ILoggerFactory logs, CancellationToken ct) =>
            {
                if (Validate(request) is { } problem) return problem;

                var added = await service.SubscribeAsync(request.Email, request.Source, ct);

                if (!added)
                {
                    // 409 → Next.js tarafı bunu "Bu e-posta zaten kayıtlı." mesajına çevirir.
                    return Results.Problem(
                        title: "Zaten kayıtlı",
                        detail: "Bu e-posta adresi zaten abone.",
                        statusCode: StatusCodes.Status409Conflict);
                }

                logs.CreateLogger("Newsletter")
                    .LogInformation("Yeni abone eklendi. Kaynak: {Source}", request.Source);

                return Results.Ok(new SubscribeResponse(true, "Aboneliğin oluşturuldu. Hoş geldin!"));
            })
            .WithName("SubscribeToNewsletter")
            .WithSummary("Bülten aboneliği oluşturur.")
            .Produces<SubscribeResponse>()
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesValidationProblem();
    }

    // -------------------------------------------------------------- YORUMLAR

    private static void MapComments(RouteGroupBuilder api)
    {
        api.MapGet("/comments", async (string? slug, ICommentService service, CancellationToken ct) =>
            {
                if (string.IsNullOrWhiteSpace(slug))
                    return Results.BadRequest(new { detail = "slug parametresi zorunludur." });

                var comments = await service.GetBySlugAsync(slug, ct);
                return Results.Ok(comments);
            })
            .WithName("GetComments")
            .WithSummary("Bir yazının yorumlarını getirir.")
            .Produces<IReadOnlyList<CommentDto>>();

        api.MapPost("/comments",
            async (CommentRequest request, ICommentService service, CancellationToken ct) =>
            {
                if (Validate(request) is { } problem) return problem;

                // TODO: üretimde moderasyon + hız sınırı ekle.
                var comment = await service.AddAsync(request, ct);
                return Results.Created($"/api/comments?slug={request.Slug}", comment);
            })
            .WithName("AddComment")
            .WithSummary("Yeni yorum ekler.")
            .Produces<CommentDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }

    // -------------------------------------------------------------- İLETİŞİM

    private static void MapContact(RouteGroupBuilder api)
    {
        api.MapPost("/contact",
            async (ContactRequest request, IContactService contacts, ILoggerFactory logs,
                   CancellationToken ct) =>
            {
                if (Validate(request) is { } problem) return problem;

                await contacts.SaveAsync(request, ct);

                // TODO: mesajlar şu an sadece veritabanına yazılıyor.
                // Anında haberdar olmak istersen buraya e-posta gönderimi ekle
                // (SMTP / SendGrid / Postmark).
                logs.CreateLogger("Contact")
                    .LogInformation("İletişim mesajı kaydedildi: {Subject}",
                        request.Subject ?? "(konu yok)");

                return Results.Accepted();
            })
            .WithName("SendContactMessage")
            .WithSummary("İletişim formu mesajını alır.")
            .ProducesValidationProblem();
    }

    // ---------------------------------------------------------- İSTATİSTİKLER

    private static void MapPostStats(RouteGroupBuilder api)
    {
        api.MapPost("/posts/{slug}/view",
            async (string slug, IPostStatsService stats, CancellationToken ct) =>
            {
                var views = await stats.IncrementViewAsync(slug, ct);
                return Results.Ok(new PostStats(slug, views));
            })
            .WithName("TrackPostView")
            .WithSummary("Yazı görüntülenme sayacını artırır.")
            .Produces<PostStats>();

        api.MapGet("/posts/{slug}/stats",
            async (string slug, IPostStatsService stats, CancellationToken ct) =>
                Results.Ok(await stats.GetAsync(slug, ct)))
            .WithName("GetPostStats")
            .WithSummary("Yazı istatistiklerini getirir.")
            .Produces<PostStats>();
    }
}
