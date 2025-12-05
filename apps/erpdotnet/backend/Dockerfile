FROM mcr.microsoft.com/dotnet/aspnet:9.0

RUN apt update -y && apt install -y curl

WORKDIR /app

COPY . .

RUN mkdir -p /app/wwwroot/pdfs

ENV ASPNETCORE_URLS=http://0.0.0.0:80

ENTRYPOINT ["dotnet", "backend.dll"]
