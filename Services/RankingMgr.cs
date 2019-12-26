using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Extensions.FileProviders;
using System.Text.RegularExpressions;

namespace ranking_showcase.Service {
    public class RankingItm {
        public int id {get;set;}
        public int rank {get;set;}
        public int bgmrank {get;set;}
        public String name {get;set;}
    }
    public class RankingMgr {
        private List<RankingItm> rankingItms = new List<RankingItm>();
        private IFileProvider _fileProvider;
        private Regex rgx = new Regex(@"customrank_(\d+)_(\d+)_(\d+).csv", RegexOptions.Compiled);
        public string currentFile {get; private set;}
        public RankingMgr(IFileProvider fileProvider) {
            this._fileProvider = fileProvider;
            this.refresh(null);
        }

        public void refresh(string fileName) {
            if (String.IsNullOrEmpty(fileName)) return;
            var rankingFile = this._fileProvider.GetFileInfo(fileName);
            if (rankingFile.Exists) {
                this.rankingItms.Clear();
                currentFile = fileName;
                using(StreamReader stm = new StreamReader(rankingFile.CreateReadStream())) {
                    string line;
                    stm.ReadLine();
                    while ((line = stm.ReadLine()) != null) {
                        var rec = line.Split(',', 4);
                        rankingItms.Add(new RankingItm{
                            id = Convert.ToInt32(rec[0]),
                            rank = Convert.ToInt32(rec[1]),
                            bgmrank = Convert.ToInt32(rec[2]),
                            name = rec[3]
                        });
                    }
                }
            } else {
                throw new FileNotFoundException($"{fileName} not found in current directory.");
            }
            
        }

        public IEnumerable<RankingItm> readAll(int begin=0, int len=50000) {
            return rankingItms.Skip(begin).Take(len);
        }

        public RankingItm readById(int id) {
            return rankingItms.Where(itm => itm.id == id).FirstOrDefault();
        }

        public RankingItm readByRank(int rank) {
            return rankingItms.Where(itm => itm.rank == rank).FirstOrDefault();
        }

        public RankingItm readByBgmrank(int bgmrank) {
            return rankingItms.Where(itm => itm.bgmrank == bgmrank).FirstOrDefault();
        }

        public IEnumerable<RankingItm> searchByName(string name) {
            return rankingItms.Where(itm => itm.name.Contains(name));
        }

        public DateTime readUpdateDate() {
            var matcher = this.rgx.Match(this.currentFile);
            if (matcher.Success) {
                return new DateTime(Convert.ToInt32(matcher.Groups[1].Value), Convert.ToInt32(matcher.Groups[2].Value), Convert.ToInt32(matcher.Groups[3].Value));
            } else {
                return new DateTime();
            }
        }
    }
}