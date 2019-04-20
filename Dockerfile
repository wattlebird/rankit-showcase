FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.cs *.csproj *.json ./
COPY ClientApp ./ClientApp
COPY Controllers ./Controllers
COPY Pages ./Pages
COPY Services ./Services
RUN dotnet restore

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash && \
apt-get install -y nodejs

# copy everything else and build app
RUN dotnet publish -c Release -o out


FROM microsoft/dotnet:2.1-aspnetcore-runtime AS runtime
WORKDIR /app
COPY --from=build /app/out ./
COPY customrank.csv ./
EXPOSE 5000
ENTRYPOINT ["dotnet", "ranking-showcase.dll"]
