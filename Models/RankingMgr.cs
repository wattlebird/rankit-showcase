using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Extensions.FileProviders;

namespace ranking_showcase.Models {
    public class RankingItm {
        public int id {get;set;}
        public int rank {get;set;}
        public int bgmrank {get;set;}
        public String name {get;set;}
    }
    public class RankingMgr {
        private List<RankingItm> rankingItms = new List<RankingItm>();
        public RankingMgr(IFileProvider fileProvider) {
            var rankingFile = fileProvider.GetFileInfo("customrank.csv");
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
    }
}