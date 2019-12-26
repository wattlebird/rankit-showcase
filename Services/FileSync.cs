using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.File;
using System.Text.RegularExpressions;

namespace ranking_showcase.Service {
    public class FileSync : IHostedService, IDisposable {
        private Timer _timer;
        private Regex rgx = new Regex(@"customrank_(\d+)_(\d+)_(\d+).csv", RegexOptions.Compiled);
        private IFileProvider _fileProvider;
        private RankingMgr _rankingMgr;

        public FileSync(
            IFileProvider fileProvider,
            RankingMgr rankingMgr
        ) {
            this._fileProvider = fileProvider;
            this._rankingMgr = rankingMgr;
        }

        public Task StartAsync(CancellationToken cancellationToken) {
            _timer = new Timer(this.DownloadFileWrapper, null, TimeSpan.Zero, TimeSpan.FromHours(1));
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken) {
            _timer?.Change(Timeout.Infinite, Timeout.Infinite);
            return Task.CompletedTask;
        }

        private void DownloadFileWrapper(object state) {
            this.DownloadFile().GetAwaiter().GetResult();
        }
        
        private async Task DownloadFile() {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                Environment.GetEnvironmentVariable("AZURE_STORAGE_IKELY_CONNECTIONSTRING")
            );
            CloudFileClient fileClient = storageAccount.CreateCloudFileClient();
            CloudFileShare share = fileClient.GetShareReference("bangumi-publish");
            CloudFileDirectory dir = share.GetRootDirectoryReference().GetDirectoryReference("ranking");
            FileContinuationToken token = null;
            DateTime date = new DateTime(2018, 1, 1);
            do
            {
                FileResultSegment resultSegment = await dir.ListFilesAndDirectoriesSegmentedAsync(token);
                token = resultSegment.ContinuationToken;
                foreach (IListFileItem rankItm in resultSegment.Results)
                {
                    string fileName = rankItm.Uri.ToString();
                    var match = rgx.Match(fileName);
                    if (match.Success) {
                        DateTime newdate = new DateTime(Convert.ToInt32(match.Groups[1].Value), Convert.ToInt32(match.Groups[2].Value), Convert.ToInt32(match.Groups[3].Value));
                        if (newdate.CompareTo(date) > 0) {
                            date = newdate;
                        }
                    }
                }
            }
            while (token != null);  
            if (date.CompareTo(new DateTime(2018, 1, 1) ) != 0) {
                string rankingFile = $"customrank_{date.ToString("yyyy_MM_dd")}.csv";
                CloudFile fr = dir.GetFileReference(rankingFile);
                // One should check whether there's an existing file
                bool ex = await fr.ExistsAsync();
                if (ex) {
                    await fr.DownloadToFileAsync(rankingFile, FileMode.Create);
                }
                if (this._rankingMgr.currentFile != rankingFile) {
                    this._rankingMgr.refresh(rankingFile);
                }
            }
        }

        public void Dispose() {
            _timer?.Dispose();
        }
    }
}