using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Website1.Api.Data;
using Website1.Api.Endpoints;
using Website1.Api.Services;

var builder = WebApplication.CreateBuilder(args);

/* ---------------------------------------------------------------------------
 *  JSON — Next.js tarafı camelCase bekliyor (item.changePercent gibi).
 * ------------------------------------------------------------------------- */
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

/* ---------------------------------------------------------------------------
 *  VERİTABANI — SQLite
 *  Dosya yolu appsettings.json → ConnectionStrings:Default
 *  PostgreSQL/SQL Server'a geçmek istersen sadece bu satırı ve paketi değiştir.
 * ------------------------------------------------------------------------- */
var connectionString = builder.Configuration.GetConnectionString("Default")
                       ?? "Data Source=website1.db";

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

/* ---------------------------------------------------------------------------
 *  CORS — izinli adresler appsettings.json → Cors:AllowedOrigins içinde.
 *
 *  Not: Next.js Server Component'leri ve Server Action'lar isteği sunucudan
 *  attığı için CORS'a takılmaz; bu ayar istemci tarafı çağrılar içindir.
 * ------------------------------------------------------------------------- */
const string CorsPolicy = "frontend";

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

/* ---------------------------------------------------------------------------
 *  TCMB KUR SERVİSİ
 *  Resmî günlük kur bülteni. Ayarlar: appsettings.json → Tcmb
 * ------------------------------------------------------------------------- */
builder.Services.Configure<TcmbOptions>(
    builder.Configuration.GetSection(TcmbOptions.SectionName));

builder.Services.AddHttpClient(TcmbRatesService.HttpClientName, client =>
{
    client.BaseAddress = new Uri("https://www.tcmb.gov.tr/");
    client.Timeout = TimeSpan.FromSeconds(10);
    // TCMB bazı istemcileri User-Agent'sız reddedebiliyor.
    client.DefaultRequestHeaders.UserAgent.ParseAdd("Website1/1.0 (+blog rates widget)");
});

builder.Services.AddMemoryCache();

/* ---------------------------------------------------------------------------
 *  UYGULAMA SERVİSLERİ
 *
 *  Kur verisi:  TcmbRatesService  → gerçek, resmî kaynak
 *               SampleRatesService → sahte veri, sadece çevrimdışı geliştirme
 *  Depolama:    Ef*Service        → SQLite'a kalıcı yazar
 *               InMemory*Service  → bellekte tutar, yeniden başlayınca silinir
 * ------------------------------------------------------------------------- */
builder.Services.AddSingleton<IRatesService, TcmbRatesService>();

builder.Services.AddScoped<INewsletterService, EfNewsletterService>();
builder.Services.AddScoped<ICommentService, EfCommentService>();
builder.Services.AddScoped<IPostStatsService, EfPostStatsService>();
builder.Services.AddScoped<IContactService, EfContactService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

/* Beklenmeyen hatalarda da ProblemDetails biçiminde yanıt dön. */
builder.Services.AddProblemDetails();

var app = builder.Build();

/* ---------------------------------------------------------------------------
 *  ŞEMAYI UYGULA
 *  Migration'lar başlangıçta otomatik çalışır — deploy sonrası elle komut
 *  çalıştırmana gerek kalmaz. Çok örnekli (scale-out) bir kuruluma geçersen
 *  bunu CI/CD adımına taşı; iki örnek aynı anda migrate etmemeli.
 * ------------------------------------------------------------------------- */
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler();
    app.UseHttpsRedirection();
}

app.UseStatusCodePages();
app.UseCors(CorsPolicy);

app.MapApiEndpoints();

app.Run();
