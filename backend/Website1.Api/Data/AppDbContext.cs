using Microsoft.EntityFrameworkCore;

namespace Website1.Api.Data;

/* ===========================================================================
 *  VERİTABANI VARLIKLARI
 *  ---------------------------------------------------------------------------
 *  Models/Contracts.cs içindeki record'lar API sözleşmesidir (dışarı bakan yüz).
 *  Buradakiler ise veritabanı satırlarıdır. İkisini ayrı tutmak, API'yi
 *  bozmadan şemayı değiştirebilmeni sağlar.
 * ========================================================================= */

public class SubscriberEntity
{
    public Guid Id { get; set; }

    /// <summary>Her zaman küçük harfe normalize edilerek saklanır.</summary>
    public string Email { get; set; } = string.Empty;

    public string Source { get; set; } = "web";
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Abonelikten çıkıldığında satır silinmez, işaretlenir (KVKK kaydı).</summary>
    public bool IsActive { get; set; } = true;

    public DateTimeOffset? UnsubscribedAt { get; set; }
}

public class CommentEntity
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Moderasyon: onaylanmayan yorumlar API'den dönmez.</summary>
    public bool IsApproved { get; set; }
}

public class PostViewEntity
{
    public string Slug { get; set; } = string.Empty;
    public long Views { get; set; }
    public DateTimeOffset LastViewedAt { get; set; }
}

public class ContactMessageEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public bool IsHandled { get; set; }
}

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<SubscriberEntity> Subscribers => Set<SubscriberEntity>();
    public DbSet<CommentEntity> Comments => Set<CommentEntity>();
    public DbSet<PostViewEntity> PostViews => Set<PostViewEntity>();
    public DbSet<ContactMessageEntity> ContactMessages => Set<ContactMessageEntity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<SubscriberEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(320).IsRequired();
            e.Property(x => x.Source).HasMaxLength(120);
            // Aynı e-postanın iki kez kaydedilmesini veritabanı seviyesinde engelle.
            e.HasIndex(x => x.Email).IsUnique();
        });

        b.Entity<CommentEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Slug).HasMaxLength(200).IsRequired();
            e.Property(x => x.Author).HasMaxLength(80).IsRequired();
            e.Property(x => x.Email).HasMaxLength(320);
            e.Property(x => x.Content).HasMaxLength(4000).IsRequired();
            // Yazı sayfası "bu slug'ın onaylı yorumları" sorgusunu atar.
            e.HasIndex(x => new { x.Slug, x.IsApproved });
        });

        b.Entity<PostViewEntity>(e =>
        {
            e.HasKey(x => x.Slug);
            e.Property(x => x.Slug).HasMaxLength(200);
        });

        b.Entity<ContactMessageEntity>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(120).IsRequired();
            e.Property(x => x.Email).HasMaxLength(320).IsRequired();
            e.Property(x => x.Subject).HasMaxLength(200);
            e.Property(x => x.Message).HasMaxLength(5000).IsRequired();
            e.HasIndex(x => x.CreatedAt);
        });
    }
}
