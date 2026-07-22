using Microsoft.EntityFrameworkCore;
using Website1.Api.Data;
using Website1.Api.Models;

namespace Website1.Api.Services;

/* ===========================================================================
 *  KALICI (EF Core / SQLite) SERVİS UYGULAMALARI
 *  ---------------------------------------------------------------------------
 *  Bellek içi sürümlerle aynı arayüzleri uygular. Program.cs'te hangisinin
 *  kayıtlı olduğunu değiştirmek dışında hiçbir yere dokunmak gerekmez.
 * ========================================================================= */

public sealed class EfNewsletterService(AppDbContext db) : INewsletterService
{
    public async Task<bool> SubscribeAsync(string email, string source, CancellationToken ct = default)
    {
        var normalized = email.Trim().ToLowerInvariant();

        var existing = await db.Subscribers
            .FirstOrDefaultAsync(s => s.Email == normalized, ct);

        if (existing is not null)
        {
            // Daha önce çıkmışsa yeniden aktif et — bu bir "çakışma" değil.
            if (existing.IsActive) return false;

            existing.IsActive = true;
            existing.UnsubscribedAt = null;
            existing.Source = source;
            await db.SaveChangesAsync(ct);
            return true;
        }

        db.Subscribers.Add(new SubscriberEntity
        {
            Id = Guid.NewGuid(),
            Email = normalized,
            Source = source,
            CreatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        });

        try
        {
            await db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateException)
        {
            // İki istek aynı anda geldiyse unique index devreye girer.
            return false;
        }
    }

    public async Task<IReadOnlyList<Subscriber>> GetAllAsync(CancellationToken ct = default)
        => await db.Subscribers
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new Subscriber(s.Id, s.Email, s.Source, s.CreatedAt))
            .ToListAsync(ct);
}

public sealed class EfCommentService(AppDbContext db, IConfiguration config) : ICommentService
{
    /// <summary>
    /// true ise yorumlar yayımlanmadan önce onay bekler.
    /// appsettings.json → Comments:RequireApproval
    /// </summary>
    private bool RequireApproval => config.GetValue("Comments:RequireApproval", true);

    public async Task<IReadOnlyList<CommentDto>> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await db.Comments
            .Where(c => c.Slug == slug && c.IsApproved)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto(c.Id, c.Slug, c.Author, c.Content, c.CreatedAt))
            .ToListAsync(ct);

    public async Task<CommentDto> AddAsync(CommentRequest request, CancellationToken ct = default)
    {
        var entity = new CommentEntity
        {
            Id = Guid.NewGuid(),
            Slug = request.Slug,
            Author = request.Author.Trim(),
            Email = request.Email?.Trim().ToLowerInvariant(),
            Content = request.Content.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            IsApproved = !RequireApproval
        };

        db.Comments.Add(entity);
        await db.SaveChangesAsync(ct);

        return new CommentDto(entity.Id, entity.Slug, entity.Author, entity.Content, entity.CreatedAt);
    }
}

public sealed class EfPostStatsService(AppDbContext db) : IPostStatsService
{
    public async Task<long> IncrementViewAsync(string slug, CancellationToken ct = default)
    {
        var row = await db.PostViews.FirstOrDefaultAsync(p => p.Slug == slug, ct);

        if (row is null)
        {
            row = new PostViewEntity { Slug = slug, Views = 0 };
            db.PostViews.Add(row);
        }

        row.Views += 1;
        row.LastViewedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        return row.Views;
    }

    public async Task<PostStats> GetAsync(string slug, CancellationToken ct = default)
    {
        var views = await db.PostViews
            .Where(p => p.Slug == slug)
            .Select(p => p.Views)
            .FirstOrDefaultAsync(ct);

        return new PostStats(slug, views);
    }
}

public interface IContactService
{
    Task SaveAsync(ContactRequest request, CancellationToken ct = default);
}

public sealed class EfContactService(AppDbContext db) : IContactService
{
    public async Task SaveAsync(ContactRequest request, CancellationToken ct = default)
    {
        db.ContactMessages.Add(new ContactMessageEntity
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Subject = request.Subject?.Trim(),
            Message = request.Message.Trim(),
            CreatedAt = DateTimeOffset.UtcNow,
            IsHandled = false
        });

        await db.SaveChangesAsync(ct);
    }
}
