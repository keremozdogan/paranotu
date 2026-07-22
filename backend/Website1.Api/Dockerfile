# =============================================================================
#  .NET 8 API — production imajı
#  Kök dizinden derle:  docker build -f backend/Website1.Api/Dockerfile -t website1-api .
# =============================================================================

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Önce sadece csproj'u kopyala — restore katmanı, kod değişince yeniden çalışmasın.
COPY backend/Website1.Api/Website1.Api.csproj backend/Website1.Api/
RUN dotnet restore backend/Website1.Api/Website1.Api.csproj

COPY backend/ backend/
RUN dotnet publish backend/Website1.Api/Website1.Api.csproj \
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

# -----------------------------------------------------------------------------

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# root olarak çalıştırma.
RUN adduser --disabled-password --gecos "" --uid 5678 appuser

# SQLite dosyasının yaşayacağı dizin. Hosting tarafında BURAYA kalıcı bir
# volume bağla — aksi halde her deploy'da aboneler ve yorumlar silinir.
RUN mkdir -p /data && chown appuser /data
VOLUME /data

COPY --from=build /app/publish .
USER appuser

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080 \
    ConnectionStrings__Default="Data Source=/data/website1.db"

EXPOSE 8080

# Not: aspnet imajında curl/wget yoktur, bu yüzden Docker HEALTHCHECK tanımlamıyoruz.
# Hosting sağlayıcısının HTTP sağlık kontrolünü şu yola ayarla:  GET /health

ENTRYPOINT ["dotnet", "Website1.Api.dll"]
